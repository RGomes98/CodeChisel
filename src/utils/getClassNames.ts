import { generateFormattedClassName } from './generateFormattedClassName';
import { generateClassNamesData } from './generateClassNamesData';
import type { Option } from './updateFormState';
import { parseFormData } from './parseFormData';
import { getFormCases } from './getFormCases';

export type GetClassNames = { input: string; formType: Option; moduleName?: string };

export const getClassNames = (parameters: GetClassNames) => {
  const { input, formType, moduleName } = parameters;
  const classNames: string[] = [];
  let classNameCount = 0;
  let className = '';

  const { baseString, start, end } = getFormCases({ formType, moduleName });
  const isInputDataValid = parseFormData({ input, formType, moduleName, baseString, end });
  const invalidInputErrorMessage = 'Invalid code syntax. Please check for errors or missing elements.';

  if (!isInputDataValid) return generateClassNamesData({ errorMessage: invalidInputErrorMessage });

  for (let i = 0; i < input.length; i++) {
    if (input[i] === baseString[classNameCount]) {
      className += input[i];
      classNameCount++;
    } else {
      className = '';
      classNameCount = 0;
    }

    if (className.length === baseString.length) {
      className = '';
      const openingTag = input[i + 1];
      const closingTag = formType === 'module' ? end[0] : openingTag;
      const foundOpeningMark = start.some((symbol) => openingTag === symbol);

      if (!foundOpeningMark) continue;

      i += 2;

      while (true) {
        const foundClosingMark = input[i] === closingTag;
        if (foundClosingMark || i >= input.length) break;

        if (input[i] === ' ') {
          const [isClassNameRepeated, formattedClassName] = generateFormattedClassName(className, classNames);
          if (!isClassNameRepeated && formattedClassName) classNames.push(formattedClassName);
          className = '';
        }

        className += input[i];
        i++;
      }

      const [isClassNameRepeated, formattedClassName] = generateFormattedClassName(className, classNames);
      if (!isClassNameRepeated && formattedClassName) classNames.push(formattedClassName);
      className = '';
    }
  }

  const classNamesCount = classNames.length;
  const classNamesData = classNames.toString().split(',').join('\n');
  const classNamesNotFoundErrorMessage = 'No class names were identified in the provided code snippet.';

  if (!classNamesCount) return generateClassNamesData({ errorMessage: classNamesNotFoundErrorMessage });
  return generateClassNamesData({ count: classNamesCount, classNames: classNamesData });
};
