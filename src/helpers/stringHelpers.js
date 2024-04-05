function camelToKebabCase(input) {
  return input
    .split(/\.?(?=[A-Z])/)
    .join('-')
    .toLowerCase();
}

export {camelToKebabCase};
