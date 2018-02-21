// Field is a better name than Input, see Django Form fields https://docs.djangoproject.com/en/1.11/ref/forms/fields/
export interface Field {
  validateEventEmitted: boolean;
}

export interface Fields {
  // Could be also Map<string, Field>
  [fieldName: string]:
    Field |
    undefined // undefined means the field (<input name="username">) is not associated with a FieldFeedbacks
    ;
}
