/**
 * Mentor Service – TypeScript port (No Python / external LLM required)
 *
 * Self-contained service that handles chat, challenge evaluation,
 * hint generation, and recommendation logic.
 */

import * as db from "./db";

// ---------------------------------------------------------------------------
// Language knowledge base
// ---------------------------------------------------------------------------

const LANGUAGE_TIPS: Record<string, Record<string, string>> = {
  python: {
    loops: "In Python, use `for item in iterable:` for iteration. `range(n)` generates numbers 0 to n-1. Use `while` for condition-based loops. `enumerate()` gives both index and value.",
    conditionals: "Python uses `if`, `elif`, `else` for branching. Conditions don't need parentheses. Use `and`, `or`, `not` for boolean logic. Ternary: `x if condition else y`.",
    functions: "Define functions with `def name(params):`. Use `return` to send values back. Default parameters: `def f(x=10):`. Use `*args` and `**kwargs` for variable arguments.",
    strings: "Strings are immutable sequences. Use f-strings: `f'Hello {name}'`. Common methods: `.split()`, `.strip()`, `.replace()`, `.join()`, `.upper()`, `.lower()`, `.find()`.",
    lists: "Lists are mutable ordered collections: `my_list = [1, 2, 3]`. Methods: `.append()`, `.extend()`, `.insert()`, `.remove()`, `.pop()`, `.sort()`, `.reverse()`. Slicing: `list[start:end:step]`.",
    basics: "Python uses indentation for blocks. Variables don't need type declarations. Use `print()` for output and `input()` for user input. Install packages with `pip`.",
    "data-structures": "Python built-in structures: list (ordered, mutable), tuple (ordered, immutable), set (unordered, unique), dict (key-value). Collections module adds deque, Counter, defaultdict.",
    oop: "Classes defined with `class Name:`. `__init__` is constructor. `self` refers to instance. Inheritance: `class Child(Parent):`. Use `super()` to call parent methods.",
    recursion: "A function that calls itself. Always needs a base case to stop. Example: factorial(n) = n * factorial(n-1), base case: factorial(0) = 1. Watch for stack overflow on deep recursion.",
  },
  c: {
    basics: 'C programs start with `#include <stdio.h>` and `int main()`. Use `printf()` for output, `scanf()` for input. Every statement ends with `;`. Compile with `gcc file.c -o output`.',
    loops: "C has `for(init; cond; update)`, `while(cond)`, `do-while`. `break` exits loop, `continue` skips iteration.",
    functions: 'Declare: `int add(int a, int b) { return a + b; }`. Prototypes go before main. Pass by value (default) or pass by pointer. `void` for no return value.',
    pointers: "Store memory addresses: `int *p = &x;`. Dereference: `*p` gives value. Pointer arithmetic: `p++` moves to next element.",
  },
  java: {
    basics: "Java programs need `public class Name { public static void main(String[] args) { } }`. Compile: `javac File.java`. Run: `java File`. Everything is inside classes.",
    loops: 'Same as C: `for`, `while`, `do-while`. Enhanced for: `for(int x : array)`. `break` and `continue` work.',
    oop: "Four pillars: Encapsulation, Inheritance, Polymorphism, Abstraction. `class Child extends Parent`. `implements` for interfaces.",
    functions: 'Methods belong to classes: `public int add(int a, int b) { return a+b; }`. `static` methods don\'t need object instance.',
  },
  cpp: {
    basics: 'C++ uses `#include <iostream>` and `using namespace std;`. Output: `cout << "Hello";`. Input: `cin >> x;`.',
    loops: "C-style loops plus range-based for: `for(auto& x : container)`. Works with arrays, vectors, strings.",
    oop: "Classes with access modifiers. Constructors, destructors (`~ClassName`). Inheritance: `class Child : public Parent`.",
    functions: 'Support overloading, default params, references. Templates: `template<typename T> T max(T a, T b)`. Lambda: `auto f = [](int x) { return x*2; };`.',
  },
  javascript: {
    basics: "JS runs in browsers and Node.js. Variables: `let`, `const` (block-scoped), `var` (function-scoped). Console: `console.log()`.",
    loops: "`for`, `while`, `do-while`, `for...of` (values), `for...in` (keys). Array methods: `.forEach()`, `.map()`, `.filter()`, `.reduce()`.",
    functions: "Function declaration, expression, arrow: `const f = (x) => x * 2;`. Closures capture outer scope. Default params. Rest params: `(...args)`.",
    async: 'Callbacks → Promises → async/await. `fetch()` returns Promise. `async function f() { const data = await fetch(url); }`. `Promise.all()` for parallel.',
  },
};

function getTip(language: string, concept: string): string {
  const langTips = LANGUAGE_TIPS[language] ?? LANGUAGE_TIPS.python ?? {};
  if (langTips[concept]) return langTips[concept];
  for (const [key, val] of Object.entries(langTips)) {
    if (concept.toLowerCase().includes(key) || key.includes(concept.toLowerCase())) return val;
  }
  const values = Object.values(langTips);
  return values[0] ?? "Practice writing clean, well-structured code.";
}

// ---------------------------------------------------------------------------
// Response generators (one per mode)
// ---------------------------------------------------------------------------

function generateExplainResponse(code: string, prompt: string, language: string): string {
  const lines: string[] = [`## Code Explanation (${language})\n`];
  if (code) {
    const codeLines = code.trim().split("\n");
    lines.push(`This code has **${codeLines.length} lines**. Here's what it does:\n`);
    const funcMatches = code.match(/(?:def|function)\s+(\w+)/g);
    if (funcMatches) lines.push(`**Functions defined:** ${funcMatches.map((f) => `\`${f.split(/\s+/)[1]}()\``).join(", ")}\n`);
    const classMatches = code.match(/class\s+(\w+)/g);
    if (classMatches) lines.push(`**Classes defined:** ${classMatches.map((c) => `\`${c.split(/\s+/)[1]}\``).join(", ")}\n`);
    if (code.includes("for ") || code.includes("while ")) lines.push("**Loops:** The code uses iteration to process data repeatedly.\n");
    if (code.includes("if ")) lines.push("**Conditionals:** The code includes decision-making logic.\n");
    if (code.includes("return ")) lines.push("**Returns:** The code produces output values via return statements.\n");
    lines.push("### Step-by-step breakdown:\n");
    for (let i = 0; i < Math.min(codeLines.length, 15); i++) {
      const stripped = codeLines[i].trim();
      if (stripped && !stripped.startsWith("#") && !stripped.startsWith("//"))
        lines.push(`- **Line ${i + 1}:** \`${stripped.slice(0, 80)}\` — Executes program logic\n`);
    }
    if (codeLines.length > 15) lines.push(`- *(... and ${codeLines.length - 15} more lines)*\n`);
  } else {
    lines.push(`### ${prompt}\n`);
    lines.push(getTip(language, prompt.split(/\s+/)[0] ?? "basics") + "\n");
  }
  lines.push(`\n💡 **Tip:** ${getTip(language, "basics")}`);
  return lines.join("\n");
}

function generateDebugResponse(code: string, prompt: string, language: string): string {
  const lines: string[] = [`## Debug Analysis (${language})\n`];
  if (code) {
    const issues: string[] = [];
    if (language === "python") {
      if (code.includes("print ") && !code.includes("print(")) issues.push("⚠️ **SyntaxError:** Use `print()` with parentheses (Python 3)");
      if ((code.match(/\(/g) ?? []).length !== (code.match(/\)/g) ?? []).length) issues.push("⚠️ **SyntaxError:** Mismatched parentheses");
      if (code.includes("def ") && !code.includes("return")) issues.push("⚠️ **Warning:** Function defined without a `return` statement");
    } else if (language === "c" || language === "cpp" || language === "java") {
      if ((code.match(/\{/g) ?? []).length !== (code.match(/\}/g) ?? []).length) issues.push("⚠️ **SyntaxError:** Mismatched curly braces");
    }
    if (issues.length) { lines.push("### Issues Found:\n"); issues.forEach((i) => lines.push(i + "\n")); }
    else lines.push("### No obvious syntax errors detected.\n");
    lines.push("\n### Debugging Tips:\n1. Add print/log statements to trace variable values\n2. Test with edge cases\n3. Check variable types\n4. Verify loop conditions\n");
  } else {
    lines.push(`**Problem:** ${prompt}\n`);
    lines.push("### Debugging Strategy:\n1. **Reproduce** the issue\n2. **Isolate** the problematic section\n3. **Inspect** variable values\n4. **Fix** the root cause\n5. **Test** your fix\n");
  }
  return lines.join("\n");
}

function generateCodeResponse(prompt: string, language: string): string {
  const lines: string[] = [`## Generated Code (${language})\n`];
  const pl = prompt.toLowerCase();
  if (pl.includes("hello")) {
    const snippets: Record<string, string> = {
      python: 'print("Hello, World!")',
      c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
      java: 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
      javascript: 'console.log("Hello, World!");',
    };
    lines.push(`\`\`\`${language}\n${snippets[language] ?? snippets.python}\n\`\`\`\n`);
  } else if (pl.includes("fibonacci")) {
    const snippets: Record<string, string> = {
      python: "def fibonacci(n):\n    if n <= 0:\n        return []\n    if n == 1:\n        return [0]\n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[-1] + fib[-2])\n    return fib\n\nprint(fibonacci(10))",
    };
    lines.push(`\`\`\`${language}\n${snippets[language] ?? snippets.python}\n\`\`\`\n`);
  } else {
    const templates: Record<string, string> = {
      python: `# Solution for: ${prompt}\n\ndef solve():\n    # TODO: Implement\n    pass\n\nif __name__ == '__main__':\n    solve()`,
      c: `#include <stdio.h>\n\n// Solution for: ${prompt}\nint main() {\n    // TODO: Implement\n    return 0;\n}`,
      java: `public class Solution {\n    // ${prompt}\n    public static void main(String[] args) {\n        // TODO: Implement\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\n// ${prompt}\nint main() {\n    // TODO: Implement\n    return 0;\n}`,
      javascript: `// Solution for: ${prompt}\nfunction solve() {\n    // TODO: Implement\n}\nsolve();`,
    };
    lines.push(`\`\`\`${language}\n${templates[language] ?? templates.python}\n\`\`\`\n`);
  }
  lines.push(`\n💡 **Key concept:** ${getTip(language, "functions")}`);
  return lines.join("\n");
}

function generateOptimizeResponse(code: string, prompt: string, language: string): string {
  const lines: string[] = [`## Optimization Suggestions (${language})\n`];
  if (code) {
    lines.push("### Analysis:\n");
    const codeLines = code.trim().split("\n");
    lines.push(`- **Lines of code:** ${codeLines.length}\n`);
    const suggestions: string[] = [];
    const firstFor = code.indexOf("for ");
    if (firstFor >= 0 && code.indexOf("for ", firstFor + 4) >= 0)
      suggestions.push("🔄 **Nested loops detected** — Consider hash maps to reduce O(n²) to O(n)");
    if (language === "python" && code.includes("append") && code.includes("for "))
      suggestions.push("📝 **List building in loop** — Consider list comprehension");
    if (suggestions.length) { lines.push("### Optimization Opportunities:\n"); suggestions.forEach((s) => lines.push(s + "\n")); }
    else lines.push("### Code looks reasonably optimized!\n");
    lines.push("\n### Best Practices:\n1. Use appropriate data structures\n2. Avoid unnecessary loop computations\n3. Cache repeated calculations\n4. Profile before optimizing\n");
  } else {
    lines.push(`**Request:** ${prompt}\n`);
    lines.push(getTip(language, "data-structures"));
  }
  return lines.join("\n");
}

function generateReviewResponse(code: string, prompt: string, language: string): string {
  const lines: string[] = [`## Code Review (${language})\n`];
  if (code) {
    const issues: string[] = [];
    const good: string[] = [];
    if (language === "python" && /def [A-Z]/.test(code)) issues.push("🏷️ **Naming:** Python functions should use `snake_case`");
    else if (code.includes("def ")) good.push("✅ **Naming conventions** look correct");
    if (code.includes("#") || code.includes("//") || code.includes('"""')) good.push("✅ **Documentation** is present");
    else issues.push("📝 **Documentation:** Add comments for complex logic");
    if (!code.includes("try")) issues.push("🛡️ **Error handling:** Consider adding try/except blocks");
    const codeLines = code.trim().split("\n");
    if (codeLines.length < 50) good.push("✅ **Code length** is manageable");
    else issues.push("📏 **Length:** Break into smaller functions");
    lines.push("### ✅ What's Good:\n"); good.forEach((g) => lines.push(g + "\n"));
    if (issues.length) { lines.push("\n### ⚠️ Improvements:\n"); issues.forEach((i) => lines.push(i + "\n")); }
    const score = Math.max(0, 10 - issues.length * 2);
    lines.push(`\n### 📊 Overall: **${score}/10**\n`);
  } else {
    lines.push(`**Review request:** ${prompt}\n`);
    lines.push(getTip(language, "functions"));
  }
  return lines.join("\n");
}

function generateTeachResponse(prompt: string, language: string): string {
  const lines: string[] = [`## Lesson: ${prompt.split("\n")[0].replace("Topic: ", "")} (${language})\n`];
  lines.push("Welcome to this lesson! Let's break down this concept.\n");
  
  lines.push(`### Concept Overview\n`);
  lines.push(`${getTip(language, prompt)} \n`);
  
  lines.push(`### How it works\n`);
  lines.push(`1. Use proper syntax and language features.\n`);
  lines.push(`2. Keep it clean and readable.\n`);
  lines.push(`3. Follow the standard conventions for ${language}.\n`);

  lines.push(`\n### Your Exercise\n`);
  lines.push(`Now it's your turn to practice! Write a short program that demonstrates this concept. Use the code editor to write your code and click **Run & Review** to have it evaluated.\n`);
  
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function streamChat(mode: string, code: string, language: string, prompt: string): string {
  const lang = db.normalizeLanguageName(language) ?? "python";
  const c = (code ?? "").trim();
  const p = (prompt ?? "").trim();
  if (!c && !p) return "Error: Code or prompt is required";

  switch (mode) {
    case "explain": return generateExplainResponse(c, p, lang);
    case "debug":   return generateDebugResponse(c, p, lang);
    case "generate": return generateCodeResponse(p || c, lang);
    case "optimize": return generateOptimizeResponse(c, p, lang);
    case "review":  return generateReviewResponse(c, p, lang);
    case "teach":   return generateTeachResponse(p, lang);
    default: return `Unknown mode '${mode}'. Available: explain, debug, generate, optimize, review, teach`;
  }
}

export function evaluateChallengeAttempt(
  attempt: { code: string; language: string },
  template: Record<string, unknown>
): { passed: boolean; rubric_score: number; feedback: string; mistakes: Array<Record<string, unknown>> } {
  const { code, language } = attempt;
  const promptText = String(template.prompt ?? "");

  if (!code.trim()) return { passed: false, rubric_score: 0, feedback: "No code submitted.", mistakes: [] };

  let score = 0.5;
  const parts: string[] = [];
  const lines = code.trim().split("\n");
  const nonEmpty = lines.filter((l) => l.trim() && !l.trim().startsWith("#") && !l.trim().startsWith("//"));

  if (nonEmpty.length >= 2) { score += 0.1; parts.push("Code has meaningful content."); }
  if (nonEmpty.length >= 5) score += 0.1;
  if (/def |function |void |int /.test(code)) { score += 0.1; parts.push("Good use of functions."); }
  if (code.includes("#") || code.includes("//")) { score += 0.05; parts.push("Nice documentation."); }
  const keywords = promptText.toLowerCase().match(/\b\w{4,}\b/g) ?? [];
  const codeLower = code.toLowerCase();
  const matches = keywords.filter((kw) => codeLower.includes(kw)).length;
  if (matches > 2) { score += 0.15; parts.push("Solution addresses requirements."); }
  if (/print\(|console\.log\(|System\.out|printf\(|cout/.test(code)) score += 0.05;
  if (code.includes("return ") && code.includes("def ")) { score += 0.1; parts.push("Function returns a value."); }

  score = Math.min(1, score);
  const passed = score >= 0.6;
  if (passed) parts.unshift("✅ Great job! Your solution looks good.");
  else { parts.unshift("Keep trying! Needs improvements."); parts.push("Address all requirements from the prompt."); }

  const mistakes = classifyMistakes(code, language, parts.join(" "));

  return {
    passed,
    rubric_score: Math.round(score * 100) / 100,
    feedback: parts.join(" "),
    mistakes: passed ? [] : mistakes,
  };
}

function classifyMistakes(code: string, language: string, feedback: string) {
  const mistakes: Array<Record<string, unknown>> = [];
  const fl = feedback.toLowerCase();
  if (/syntax|invalid syntax|unexpected|missing colon|indentation/.test(fl))
    mistakes.push({ mistake_type: "syntax", description: "Syntax error detected", suggestion: "Check for missing colons, incorrect indentation", confidence: 0.7 });
  if (/logic|wrong output|incorrect|algorithm/.test(fl))
    mistakes.push({ mistake_type: "logic", description: "Logic error detected", suggestion: "Review algorithm, test with different inputs", confidence: 0.6 });
  if (/error|exception|traceback|runtime|failed/.test(fl))
    mistakes.push({ mistake_type: "runtime", description: "Runtime error detected", suggestion: "Check error messages, handle edge cases", confidence: 0.8 });
  if (!mistakes.length)
    mistakes.push({ mistake_type: "debugging-strategy", description: "General debugging needed", suggestion: "Test thoroughly and trace logic", confidence: 0.4 });
  return mistakes;
}

export async function generateNextRecommendation(learnerId: number) {
  const profile = await db.getLearnerProfile(learnerId);
  if (!profile) return null;

  const preferredLanguages = db.parseTextList(profile.preferred_languages);
  const currentLanguage = db.normalizeLanguageName(String(profile.current_language ?? "")) ?? "python";

  const languagePriority: string[] = [];
  for (const lang of [currentLanguage, ...preferredLanguages]) {
    const n = db.normalizeLanguageName(lang);
    if (n && !languagePriority.includes(n)) languagePriority.push(n);
  }

  let challenges: Record<string, unknown>[] = [];
  for (const lang of languagePriority) {
    challenges.push(...(await db.getChallengeTemplates({ language: lang })));
  }
  if (!challenges.length) challenges = await db.getChallengeTemplates();
  if (!challenges.length) return null;

  const completedIds = new Set(await db.getCompletedChallengeIds(learnerId));
  const incomplete = challenges.filter((c) => !completedIds.has(Number(c.id)));
  if (incomplete.length) challenges = incomplete;

  const proficiencies = await db.getLanguageProficiencies(learnerId);
  const profByLang: Record<string, Record<string, unknown>> = {};
  for (const p of proficiencies) profByLang[String(p.language)] = p;

  let best: Record<string, unknown> | null = null;
  let bestScore = -1;
  for (const ch of challenges) {
    let score = 0.5;
    const prof = profByLang[String(ch.language)];
    let target = "easy";
    if (prof) {
      const s = Number(prof.score ?? 0);
      if (s >= 0.75) target = "hard";
      else if (s >= 0.45) target = "medium";
    }
    if (ch.difficulty === target) score += 0.2;
    if (ch.language === currentLanguage) score += 0.1;
    if (score > bestScore) { bestScore = score; best = ch; }
  }
  return best ?? challenges[0] ?? null;
}

export function generatePersonalizedHint(hintTemplatesStr: string, attemptNumber: number): string {
  let hints: string[];
  try { hints = JSON.parse(hintTemplatesStr); }
  catch { hints = []; }
  if (!hints.length) return "Try breaking the problem into smaller steps.";
  const idx = Math.min(attemptNumber, hints.length - 1);
  return hints[idx];
}

// ---------------------------------------------------------------------------
// Normalization helpers for API responses
// ---------------------------------------------------------------------------

function safeJsonParse(value: unknown, fallback: unknown): unknown {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return fallback;
    try { return JSON.parse(text); } catch { return fallback; }
  }
  return fallback;
}

export function normalizeProfile(profile: Record<string, unknown> | null) {
  if (!profile) return null;
  const preferred = db.parseTextList(profile.preferred_languages);
  return {
    ...profile,
    preferred_languages: preferred,
    preferred_languages_display: preferred.map((l) => l.charAt(0).toUpperCase() + l.slice(1)).join(", "),
    current_language: db.normalizeLanguageName(String(profile.current_language ?? "")) ?? "python",
  };
}

export function normalizeChallenge(ch: Record<string, unknown> | null) {
  if (!ch) return null;
  return {
    ...ch,
    language: db.normalizeLanguageName(String(ch.language ?? "")) ?? "python",
    description: ch.description ?? "",
    starter_code: ch.starter_code ?? "",
    concept_tags: safeJsonParse(ch.concept_tags, []),
    hint_templates: safeJsonParse(ch.hint_templates, []),
    evaluation_rubric: safeJsonParse(ch.evaluation_rubric, {}),
  };
}
