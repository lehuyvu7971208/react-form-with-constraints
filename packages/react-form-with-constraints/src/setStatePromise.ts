// See Make setState return a promise https://github.com/facebook/react/issues/2642
export default function setStatePromise<T>(component: React.Component<any, T>, state: T) {
                                                                    // Instead of Promise<{}> given by TypeScript 2.6.2, verified inside vscode debugguer
  return new Promise(resolve => component.setState(state, resolve)) as Promise<undefined>;
}
