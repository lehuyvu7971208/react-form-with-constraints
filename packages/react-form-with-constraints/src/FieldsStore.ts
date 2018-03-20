import Field from './Field';
import { EventEmitter } from './EventEmitter';
import clearArray from './clearArray';

export enum FieldEvent {
  Added = 'FIELD_ADDED',
  Removed = 'FIELD_REMOVED',
  Updated = 'FIELD_UPDATED'
}

export class FieldsStore extends EventEmitter {
  fields = new Array<Field>();

  clear() {
    clearArray(this.fields);
  }

  getField(fieldName: string): Readonly<Field> {
    const fields = this.fields.filter(_field => _field.name === fieldName);
    console.assert(fields.length === 1, `FIXME PROBLEME avec le field '${fieldName}'`);
    return fields[0];
  }

  addField(fieldName: string) {
    const fields = this.fields.filter(_field => _field.name === fieldName);
    console.assert(fields.length === 0 || fields.length === 1, `FIXME PROBLEME avec le field '${fieldName}'`);
    if (fields.length === 0) { // Check if exists already
      const newField = new Field(fieldName);
      this.fields.push(newField);
      this.emit(FieldEvent.Added, fieldName, newField);
    }
  }

  removeField(fieldName: string) {
    const fields = this.fields.filter(_field => _field.name === fieldName);
    console.assert(fields.length === 1, `Unknown field '${fieldName}'`);
    const index = this.fields.indexOf(fields[0]);
    this.fields.splice(index, 1);
    this.emit(FieldEvent.Removed, fieldName);
  }

  isValid() {
    return this.fields.every(field => field.isValid());
  }
}
