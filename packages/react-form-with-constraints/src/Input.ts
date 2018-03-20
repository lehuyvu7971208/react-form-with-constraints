export default interface Input {
  readonly name: string;
  readonly type: string;
  readonly value: string;
  readonly validity: ValidityState;
  readonly validationMessage: string;
}
