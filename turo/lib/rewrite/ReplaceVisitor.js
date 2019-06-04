import { ASTVisitor } from '../visitors';
import PatternVisitor from './PatternVisitor';

export default class ReplaceVisitor extends ASTVisitor {
  createReplacement (pattern, captures, context, ...args) {
    let index = 1;
    for (const v of [...captures.values()]) {
      captures.set(`$${index ++}`, v);
    }

    return pattern.accept(this, captures, context, ...args);
  }

  visitBinaryOperator (pattern, ...args) {
    const [left, right] = pattern.children.map(
      child => child.accept(this, ...args)
    );

    return left.binary(pattern.literal, right);
  }

  visitUnaryOperation (pattern, captures, context, ...args) {
    const inner = pattern.inner.accept(this, captures, context, ...args);
    const literal = pattern.literal;

    switch (literal) {
      case 'eval':
        return context.evalNode(inner);

      default: 
        return inner.unary(pattern.literal, pattern.isPrefix);
    }
  }

  visitParens (pattern, ...args) {
    const inner = pattern.inner.accept(this, ...args);
    return inner.parens();
  }  

  visitNumberNode (pattern, ...args) {
    return pattern.clone();
  }

  visitIdentifier (pattern, captures, context, ...args) {
    const r = captures.get(pattern.literal);
    if (r && r.deepClone) {
      return r.deepClone()
    } else {
      return context.createIdentifier(pattern.literal);
    }
  }
}