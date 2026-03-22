'use strict';

import { Parser } from 'expr-eval';

export interface CalculatedField {
  key: string;
  label: string;
  formula: string;
  capabilityType: string;
  unit?: string;
  enableInsights: boolean;
  showOnDevice: boolean;
}

export interface SourceMapping {
  key: string;
  path: string;
  label: string;
  capabilityType: string;
  unit?: string;
  enableInsights: boolean;
  showOnDevice: boolean;
}

export default class FormulaParser {
  
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  evaluateFormula(formula: string, variables: { [key: string]: number }): number {
    try {
      const expr = this.parser.parse(formula);
      const result = expr.evaluate(variables);
      
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        throw new Error('Formula result is not a valid number');
      }
      
      return result;
    } catch (error) {
      throw new Error(`Formula evaluation failed: ${error}`);
    }
  }

  validateFormula(formula: string, availableVariables: string[]): boolean {
    try {
      const expr = this.parser.parse(formula);
      const variables = expr.variables();
      
      for (const variable of variables) {
        if (!availableVariables.includes(variable)) {
          throw new Error(`Unknown variable: ${variable}`);
        }
      }
      
      return true;
    } catch (error) {
      throw new Error(`Formula validation failed: ${error}`);
    }
  }

  extractValue(data: any, path: string, payloadType: string): number | null {
    try {
      if (payloadType === 'number') {
        const value = parseFloat(data);
        return isNaN(value) ? null : value;
      }
      
      if (payloadType === 'json_array') {
        const index = parseInt(path);
        if (isNaN(index) || !Array.isArray(data) || index >= data.length) {
          return null;
        }
        const value = parseFloat(data[index]);
        return isNaN(value) ? null : value;
      }
      
      if (payloadType === 'json_object') {
        const keys = path.split('.');
        let current = data;
        
        for (const key of keys) {
          if (current === null || current === undefined || typeof current !== 'object') {
            return null;
          }
          current = current[key];
        }
        
        const value = parseFloat(current);
        return isNaN(value) ? null : value;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

}
