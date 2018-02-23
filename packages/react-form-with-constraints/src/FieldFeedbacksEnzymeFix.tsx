import React from 'react';

import { FieldFeedbacks } from './index';

// FIXME See React 16 Fragments unsupported https://github.com/airbnb/enzyme/issues/1213
class FieldFeedbacksEnzymeFix extends FieldFeedbacks {
  // FIXME Specify render() return type to avoid:
  // src/FieldFeedback.test.tsx(28,3): error TS2322: Type 'FieldFeedbacks' is not assignable to type 'FieldFeedbacksEnzymeFix'.
  //   Types of property 'render' are incompatible.
  //     Type '() => {} | null' is not assignable to type '() => Element'.
  //       Type '{} | null' is not assignable to type 'Element'.
  //         Type 'null' is not assignable to type 'Element'.
  // src/FieldFeedbackWhenValid.test.tsx(27,3): error TS2322: Type 'FieldFeedbacks' is not assignable to type 'FieldFeedbacksEnzymeFix'.
  render(): {} | null {
    return <div data-feedbacks={this.key}>{super.render()}</div>;
  }
}

export default FieldFeedbacksEnzymeFix;
