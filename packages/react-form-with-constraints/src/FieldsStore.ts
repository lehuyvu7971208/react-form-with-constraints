import { Fields, Field } from './Fields';
import { EventEmitter } from './EventEmitter';
import fieldWithoutFeedback from './fieldWithoutFeedback';

export enum FieldEvent {
  Added = 'FIELD_ADDED',
  Removed = 'FIELD_REMOVED',
  Updated = 'FIELD_UPDATED'
}

export class FieldsStore extends EventEmitter {
  // Why Object.create(null) instead of just {}? See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Objects_and_maps_compared
  fields: Fields = Object.create(null);

  clear() {
    // tslint:disable-next-line:forin
    for (const fieldName in this.fields) {
      this.updateField(fieldName, {...fieldWithoutFeedback});
    }
  }

  private updateField(fieldName: string, field: Field) {
    console.assert(this.fields[fieldName] !== undefined, `Unknown field '${fieldName}'`);
    this.fields[fieldName] = field;
    this.emit(FieldEvent.Updated, fieldName);
  }

  addField(fieldName: string) {
    if (this.fields[fieldName] === undefined) { // Check if exists already
      const newField = {...fieldWithoutFeedback};
      this.fields[fieldName] = newField;
      this.emit(FieldEvent.Added, fieldName, newField);
    }
  }

  removeField(fieldName: string) {
    console.assert(this.fields[fieldName] !== undefined, `Unknown field '${fieldName}'`);
    delete this.fields[fieldName];
    this.emit(FieldEvent.Removed, fieldName);
  }
}
