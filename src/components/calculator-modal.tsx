"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface CalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalculatorModal({ open, onOpenChange }: CalculatorModalProps) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      // Limitar la longitud máxima del display
      const newDisplay = display === "0" ? num : display + num;
      if (newDisplay.length <= 15) {
        setDisplay(newDisplay);
      }
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = Number.parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(formatNumber(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (
    firstValue: number,
    secondValue: number,
    operation: string
  ) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return firstValue / secondValue;
      case "=":
        return secondValue;
      default:
        return secondValue;
    }
  };

  const formatNumber = (num: number): string => {
    if (isNaN(num)) return "Error";
    if (!isFinite(num)) return "Error";
    
    // Si el número es muy largo, usar notación científica
    const str = num.toString();
    if (str.length > 12) {
      if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
        return num.toExponential(6);
      }
      // Redondear para números con muchos decimales
      return Number(num.toPrecision(10)).toString();
    }
    return str;
  };

  const performCalculation = () => {
    const inputValue = Number.parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(formatNumber(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const buttons = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  // Determinar el tamaño de fuente basado en la longitud del display
  const getFontSize = () => {
    const length = display.length;
    if (length <= 8) return "text-4xl";
    if (length <= 10) return "text-3xl";
    if (length <= 12) return "text-2xl";
    return "text-xl";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100 text-lg font-semibold">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Calculator className="h-4 w-4 text-primary" />
            </div>
            Calculadora
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Display mejorado */}
          <div className="bg-gradient-to-r from-white to-slate-100 dark:from-slate-800 dark:to-slate-700 p-4 rounded-xl shadow-inner min-h-[60px] flex items-center justify-end">
            <div 
              className={`font-mono font-bold text-slate-900 dark:text-slate-100 ${getFontSize()} leading-tight overflow-hidden`}
              style={{
                wordBreak: 'break-all',
                overflowWrap: 'break-word',
                textAlign: 'right',
                maxWidth: '100%'
              }}
            >
              {display}
            </div>
          </div>

          {/* Botones */}
          <div className="grid gap-3">
            {buttons.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-4 gap-3">
                {row.map((btn) => (
                  <Button
                    key={btn}
                    variant={
                      ["C", "±", "%", "÷", "×", "-", "+", "="].includes(btn)
                        ? "secondary"
                        : "outline"
                    }
                    className={`h-14 text-lg font-medium rounded-2xl transition-all duration-150 ease-in-out hover:scale-105 active:scale-95 ${
                      btn === "0" ? "col-span-2" : ""
                    } ${
                      btn === "="
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                        : ""
                    } ${
                      ["C", "±", "%"].includes(btn)
                        ? "bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200"
                        : ""
                    } ${
                      ["÷", "×", "-", "+"].includes(btn)
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md"
                        : ""
                    }`}
                    onClick={() => {
                      if (btn === "C") {
                        clear();
                      } else if (btn === "=") {
                        performCalculation();
                      } else if (["+", "-", "×", "÷"].includes(btn)) {
                        inputOperation(btn);
                      } else if (btn === "±") {
                        const currentNum = Number.parseFloat(display);
                        if (currentNum !== 0) {
                          setDisplay(formatNumber(currentNum * -1));
                        }
                      } else if (btn === "%") {
                        const currentNum = Number.parseFloat(display);
                        setDisplay(formatNumber(currentNum / 100));
                      } else if (btn === ".") {
                        inputDecimal();
                      } else {
                        inputNumber(btn);
                      }
                    }}
                  >
                    {btn}
                  </Button>
                ))}
              </div>
            ))}
          </div>

          {/* Indicador de operación actual */}
          {operation && (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              {previousValue} {operation} ...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}