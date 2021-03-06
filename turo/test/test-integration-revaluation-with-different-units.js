import tap from 'tap';
import _ from 'underscore';
import turo from './turo-shim';

const { test, plan } = tap;

test("simple2", async function (t) {
  await turo.reset();
  turo.evaluate("import \"metric\"");
  turo.evaluate("r = 1 m");
  turo.evaluate("A = r");
  turo.evaluate("r = 1 km");
  t.equal(turo.evaluate("A").valueToString(), "1 km", "A == \"A = 1 km\"");
  t.end();
});

test("area", async function (t) {
  await turo.reset();
  turo.evaluate("import \"metric\"");
  turo.evaluate("r = 1 m");
  turo.evaluate("A = r * r");
  t.equal(turo.evaluate("A").valueToString(), "1 m^2", "A == \"A = 1 m^2\"");
  
  turo.evaluate("r = 1 km");
  // TODO rewrite this whole file in terms of EditableDocument
//  t.equal(turo.evaluate("A").valueToString(), "1 km^2", "A == \"A = 1 km^2\"");
  
  t.end();
});

test("Just expressions", async function (t) {
  await turo.reset();
  turo.evaluate("import \"metric\"");
  turo.evaluate("r = 1 m");
  turo.evaluate("r = 1 km");
  turo.evaluate("r * r");
  turo.evaluate("r = 1m");
  t.equal(turo.evaluate("r*r").toString(), "r * r = 1 m^2", "r*r == \"r * r = 1 m^2\"");
  t.end();
});

test("area km to m", async function (t) {
  await turo.reset();
  turo.evaluate("import \"metric\"");

  turo.evaluate("r = 1km");
  t.equal(turo.evaluate("r*r").toString(), "r * r = 1 km^2", "r*r == \"r * r = 1 km^2\"");

  turo.evaluate("r = 1m");
  turo.evaluate("A = r * r");
  t.equal(turo.evaluate("A").toString(), "A = 1 m^2", "A == \"A = 1 m^2\"");

  turo.evaluate("r = 1 km");
  // TODO rewrite this whole file in terms of EditableDocument
  //t.equal(turo.evaluate("A").toString(), "A = 1 km^2", "A == \"A = 1 km^2\"");

  t.equal(turo.evaluate("r*r").toString(), "r * r = 1 km^2", "r*r == \"r * r = 1 km^2\"");

  t.end();
});

