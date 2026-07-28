const fs = require('fs');
let code = fs.readFileSync('src/components/ErrorBoundary.tsx', 'utf8');

const target = `export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {`;

const replacement = `export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  public state: State = {`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/ErrorBoundary.tsx', code);
