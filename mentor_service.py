"""
Mentor Service Layer – Built-in Engine (No Ollama Required)

Self-contained Python service that handles chat, challenge evaluation,
hint generation, and recommendation logic using built-in knowledge.
"""

import json
import re
import textwrap
from typing import Optional, Dict, Any, List, Iterator
from datetime import datetime

import mentor_db as db  # type: ignore[import]


# ---------------------------------------------------------------------------
# Built-in knowledge base for generating responses
# ---------------------------------------------------------------------------

LANGUAGE_TIPS = {
    "python": {
        "loops": "In Python, use `for item in iterable:` for iteration. `range(n)` generates numbers 0 to n-1. Use `while` for condition-based loops. `enumerate()` gives both index and value.",
        "conditionals": "Python uses `if`, `elif`, `else` for branching. Conditions don't need parentheses. Use `and`, `or`, `not` for boolean logic. Ternary: `x if condition else y`.",
        "functions": "Define functions with `def name(params):`. Use `return` to send values back. Default parameters: `def f(x=10):`. Use `*args` and `**kwargs` for variable arguments.",
        "strings": "Strings are immutable sequences. Use f-strings: `f'Hello {name}'`. Common methods: `.split()`, `.strip()`, `.replace()`, `.join()`, `.upper()`, `.lower()`, `.find()`.",
        "lists": "Lists are mutable ordered collections: `my_list = [1, 2, 3]`. Methods: `.append()`, `.extend()`, `.insert()`, `.remove()`, `.pop()`, `.sort()`, `.reverse()`. Slicing: `list[start:end:step]`.",
        "tuples": "Tuples are immutable: `t = (1, 2, 3)`. Use for fixed collections. Unpacking: `a, b, c = t`. Single element tuple: `(1,)`. Faster than lists for read-only data.",
        "sets": "Sets are unordered unique collections: `s = {1, 2, 3}`. Operations: `.add()`, `.remove()`, `.union()`, `.intersection()`, `.difference()`. Great for removing duplicates.",
        "dictionaries": "Dicts store key-value pairs: `d = {'key': 'value'}`. Methods: `.get()`, `.keys()`, `.values()`, `.items()`, `.update()`. Dict comprehension: `{k: v for k, v in items}`.",
        "recursion": "A function that calls itself. Always needs a base case to stop. Example: factorial(n) = n * factorial(n-1), base case: factorial(0) = 1. Watch for stack overflow on deep recursion.",
        "data-structures": "Python built-in structures: list (ordered, mutable), tuple (ordered, immutable), set (unordered, unique), dict (key-value). Collections module adds deque, Counter, defaultdict.",
        "oop": "Classes defined with `class Name:`. `__init__` is constructor. `self` refers to instance. Inheritance: `class Child(Parent):`. Use `super()` to call parent methods.",
        "file-io": "Open files with `with open('file.txt', 'r') as f:`. Modes: 'r' read, 'w' write, 'a' append. Methods: `.read()`, `.readline()`, `.readlines()`, `.write()`.",
        "error-handling": "Use `try/except/finally` blocks. Catch specific exceptions: `except ValueError as e:`. Raise with `raise Exception('msg')`. Create custom exceptions by extending Exception.",
        "list-comprehension": "Compact syntax: `[expr for item in iterable if condition]`. Nested: `[x*y for x in range(3) for y in range(3)]`. Dict comp: `{k: v for k, v in pairs}`.",
        "lambda": "Anonymous functions: `lambda x: x * 2`. Used with `map()`, `filter()`, `sorted()`. Example: `sorted(items, key=lambda x: x.age)`. Keep them simple and short.",
        "decorators": "Functions that modify other functions. Use `@decorator` syntax. Common: `@staticmethod`, `@classmethod`, `@property`. Write custom: `def my_dec(func): def wrapper(*args): ...`",
        "generators": "Use `yield` instead of `return` for lazy evaluation. Generator expressions: `(x**2 for x in range(10))`. Memory efficient for large datasets. Use `next()` to get values.",
        "numpy": "NumPy provides n-dimensional arrays. Create: `np.array([1,2,3])`, `np.zeros(5)`, `np.arange(10)`. Operations are vectorized (fast). Supports slicing, broadcasting, linear algebra.",
        "pandas": "Pandas provides DataFrame and Series. Create: `pd.DataFrame(data)`. Read CSV: `pd.read_csv('file.csv')`. Methods: `.head()`, `.describe()`, `.groupby()`, `.merge()`, `.fillna()`.",
        "matplotlib": "Plotting library. `plt.plot(x, y)` for line charts. `plt.bar()`, `plt.scatter()`, `plt.hist()` for other types. Always call `plt.show()`. Customize with labels, titles, legends.",
    },
    "c": {
        "basics": "C programs start with `#include <stdio.h>` and `int main()`. Use `printf()` for output, `scanf()` for input. Every statement ends with `;`. Compile with `gcc file.c -o output`.",
        "variables": "Declare before use: `int x = 5;`, `float f = 3.14;`, `char c = 'A';`. C is statically typed. Use `const` for constants. `sizeof()` gives size in bytes.",
        "loops": "C has `for(init; cond; update)`, `while(cond)`, `do-while`. `break` exits loop, `continue` skips iteration. Nested loops multiply iterations. Use `i++` for increment.",
        "conditionals": "Use `if(cond)`, `else if`, `else`. Switch: `switch(var) { case 1: ...; break; }`. Ternary: `result = (a > b) ? a : b;`. Comparison operators: `==`, `!=`, `<`, `>`, `<=`, `>=`.",
        "functions": "Declare: `int add(int a, int b) { return a + b; }`. Prototypes go before main. Pass by value (default) or pass by pointer. `void` for no return value.",
        "arrays": "Fixed-size: `int arr[5] = {1,2,3,4,5};`. Access: `arr[0]`. No bounds checking! Multi-dimensional: `int matrix[3][3];`. Arrays decay to pointers when passed to functions.",
        "pointers": "Store memory addresses: `int *p = &x;`. Dereference: `*p` gives value. Pointer arithmetic: `p++` moves to next element. `NULL` is a null pointer. Critical for dynamic memory.",
        "strings": "Character arrays: `char str[] = \"hello\";`. Functions: `strlen()`, `strcpy()`, `strcmp()`, `strcat()` from `<string.h>`. Strings are null-terminated (`\\0`).",
        "structs": "Group related data: `struct Point { int x; int y; };`. Access: `p.x`. Pointer access: `p->x`. Use `typedef` for shorter names. Can contain nested structs.",
        "memory": "Dynamic allocation: `malloc()`, `calloc()`, `realloc()`, `free()`. Always free allocated memory! `sizeof()` for size. Stack vs heap: local vars are stack, malloc is heap.",
        "file-io": "Use `FILE *fp = fopen(\"file.txt\", \"r\");`. Read: `fscanf()`, `fgets()`, `fread()`. Write: `fprintf()`, `fputs()`. Always `fclose(fp);`. Check for NULL on open.",
        "preprocessor": "Directives start with `#`. `#include` for headers. `#define` for macros. `#ifdef/#endif` for conditional compilation. `#pragma` for compiler hints.",
    },
    "java": {
        "basics": "Java programs need `public class Name { public static void main(String[] args) { } }`. Compile: `javac File.java`. Run: `java File`. Everything is inside classes.",
        "variables": "Primitive types: `int`, `double`, `boolean`, `char`, `long`, `float`, `byte`, `short`. Reference types: `String`, arrays, objects. `final` for constants.",
        "loops": "Same as C: `for`, `while`, `do-while`. Enhanced for: `for(int x : array)`. `break` and `continue` work. Java 8+ streams: `list.stream().filter().forEach()`.",
        "conditionals": "Use `if/else if/else`. Switch supports String (Java 7+). Ternary: `result = (a > b) ? a : b;`. Switch expressions (Java 14+): `switch(x) { case 1 -> \"one\"; }`.",
        "functions": "Methods belong to classes: `public int add(int a, int b) { return a+b; }`. `static` methods don't need object instance. Overloading: same name, different params.",
        "oop": "Four pillars: Encapsulation, Inheritance, Polymorphism, Abstraction. `class Child extends Parent`. `implements` for interfaces. Access modifiers: public, private, protected, default.",
        "arrays": "Declare: `int[] arr = new int[5];` or `int[] arr = {1,2,3};`. Fixed size. Use `ArrayList<Integer>` for dynamic arrays. `arr.length` for size. `Arrays.sort()` to sort.",
        "strings": "Immutable: `String s = \"hello\";`. Methods: `.length()`, `.charAt()`, `.substring()`, `.equals()`, `.indexOf()`, `.split()`. Use `StringBuilder` for mutable strings.",
        "collections": "List: `ArrayList`, `LinkedList`. Set: `HashSet`, `TreeSet`. Map: `HashMap`, `TreeMap`. Queue: `PriorityQueue`. Use generics: `List<String>`. Iterator pattern.",
        "exceptions": "Try-catch-finally: `try { } catch(Exception e) { } finally { }`. Checked vs unchecked. `throws` in method signature. Custom: `class MyEx extends Exception`.",
        "inheritance": "Single inheritance: `extends`. Multiple via interfaces: `implements`. `super()` calls parent constructor. `@Override` annotation. Abstract classes can't be instantiated.",
        "interfaces": "Define contracts: `interface Drawable { void draw(); }`. Java 8+: default methods, static methods. Java 9+: private methods. Functional interfaces for lambdas.",
        "generics": "Type-safe collections: `List<String>`. Generic classes: `class Box<T> { T value; }`. Bounded: `<T extends Number>`. Wildcards: `<? extends Type>`, `<? super Type>`.",
        "file-io": "Use `BufferedReader`, `FileReader` for reading. `BufferedWriter`, `FileWriter` for writing. Try-with-resources: `try(var br = new BufferedReader(...)) { }`. NIO: `Files.readAllLines()`.",
        "multithreading": "Extend `Thread` or implement `Runnable`. `synchronized` for thread safety. `ExecutorService` for thread pools. `volatile` for visibility. Avoid deadlocks.",
    },
    "cpp": {
        "basics": "C++ uses `#include <iostream>` and `using namespace std;`. Output: `cout << \"Hello\";`. Input: `cin >> x;`. Compile: `g++ file.cpp -o output`. Supports C features plus OOP.",
        "variables": "C types plus: `bool`, `string` (from `<string>`). `auto` for type inference. `const` and `constexpr` for constants. References: `int& ref = x;`. Range-based types.",
        "loops": "C-style loops plus range-based for: `for(auto& x : container)`. Works with arrays, vectors, strings. `break`, `continue` work. Iterators for container traversal.",
        "conditionals": "Same as C: `if/else`, `switch`. C++17: `if(auto x = getValue(); x > 0)` (init statement). Structured bindings: `auto [a, b] = pair;`.",
        "functions": "Support overloading, default params, references. Templates: `template<typename T> T max(T a, T b)`. Lambda: `auto f = [](int x) { return x*2; };`. `constexpr` functions.",
        "oop": "Classes with access modifiers. Constructors, destructors (`~ClassName`). Inheritance: `class Child : public Parent`. Virtual functions for polymorphism. `override` keyword.",
        "pointers": "C pointers plus smart pointers: `unique_ptr`, `shared_ptr`, `weak_ptr` from `<memory>`. RAII pattern. `new`/`delete` for manual management. Prefer smart pointers.",
        "stl": "Standard Template Library: `vector`, `list`, `deque`, `map`, `set`, `unordered_map`, `stack`, `queue`, `priority_queue`. Algorithms: `sort()`, `find()`, `binary_search()`.",
        "strings": "`std::string` class. Methods: `.length()`, `.substr()`, `.find()`, `.replace()`, `.c_str()`. String streams: `stringstream`. Concatenation with `+`. C++20: `starts_with()`.",
        "templates": "Generic programming: `template<typename T>`. Function and class templates. Specialization. Variadic templates: `template<typename... Args>`. SFINAE. C++20 concepts.",
        "memory": "Stack vs heap. `new`/`delete`, `new[]`/`delete[]`. Smart pointers prevent leaks. RAII: acquire in constructor, release in destructor. Move semantics: `std::move()`.",
        "exceptions": "`try/catch/throw`. Standard exceptions in `<stdexcept>`: `runtime_error`, `logic_error`, etc. `noexcept` specifier. Stack unwinding on throw.",
        "file-io": "`<fstream>`: `ifstream` for reading, `ofstream` for writing, `fstream` for both. Stream operators `<<` and `>>`. Binary mode: `ios::binary`. `getline()` for lines.",
        "inheritance": "Single and multiple inheritance. Virtual functions: `virtual void f()`. Pure virtual: `= 0` makes class abstract. Virtual destructors for polymorphic deletion. Diamond problem: virtual inheritance.",
    },
    "javascript": {
        "basics": "JS runs in browsers and Node.js. Variables: `let`, `const` (block-scoped), `var` (function-scoped). Console: `console.log()`. Template literals: `` `Hello ${name}` ``.",
        "loops": "`for`, `while`, `do-while`, `for...of` (values), `for...in` (keys). Array methods: `.forEach()`, `.map()`, `.filter()`, `.reduce()`. `break` and `continue` work.",
        "conditionals": "`if/else if/else`. Ternary: `cond ? a : b`. Switch with `break`. Nullish coalescing: `a ?? b`. Optional chaining: `obj?.prop`. Truthy/falsy values.",
        "functions": "Function declaration, expression, arrow: `const f = (x) => x * 2;`. Closures capture outer scope. Default params. Rest params: `(...args)`. `this` binding rules.",
        "arrays": "Dynamic: `[1, 2, 3]`. Methods: `.push()`, `.pop()`, `.shift()`, `.unshift()`, `.splice()`, `.slice()`, `.map()`, `.filter()`, `.reduce()`, `.find()`, `.some()`, `.every()`.",
        "objects": "Key-value pairs: `{name: 'John', age: 30}`. Access: dot or bracket notation. Destructuring: `const {name, age} = obj;`. Spread: `{...obj, newProp: val}`. `Object.keys()`.",
        "strings": "Methods: `.slice()`, `.split()`, `.includes()`, `.startsWith()`, `.endsWith()`, `.replace()`, `.trim()`, `.padStart()`. Template literals for interpolation. Regex with `.match()`.",
        "oop": "Classes (ES6+): `class Name { constructor() {} }`. `extends` for inheritance. `super()`. Getters/setters. Static methods. Private fields: `#field`. Prototypal inheritance underneath.",
        "async": "Callbacks → Promises → async/await. `fetch()` returns Promise. `async function f() { const data = await fetch(url); }`. `Promise.all()` for parallel. `.then()/.catch()`.",
        "dom": "Document Object Model. `document.getElementById()`, `.querySelector()`. Modify: `.textContent`, `.innerHTML`, `.style`. Events: `.addEventListener('click', fn)`. Create elements.",
        "error-handling": "`try/catch/finally`. Custom errors: `class MyError extends Error`. `throw new Error('msg')`. Promise errors: `.catch()` or try/catch with await.",
        "es6": "Destructuring, spread/rest, template literals, arrow functions, classes, modules (import/export), Map/Set, Symbol, iterators, generators, Proxy, Reflect.",
        "closures": "Functions retain access to outer scope variables. Used for data privacy, factory functions, event handlers. Common pattern: IIFE `(function() { })()`. Module pattern.",
        "promises": "Represent async results. States: pending, fulfilled, rejected. Chain with `.then()`. Error with `.catch()`. `Promise.all()`, `Promise.race()`, `Promise.allSettled()`.",
    },
}


def _get_tip(language: str, concept: str) -> str:
    lang_tips = LANGUAGE_TIPS.get(language, LANGUAGE_TIPS.get("python", {}))
    if concept in lang_tips:
        return lang_tips[concept]
    for key, val in lang_tips.items():
        if concept.lower() in key.lower() or key.lower() in concept.lower():
            return val
    return list(lang_tips.values())[0] if lang_tips else "Practice writing clean, well-structured code."


def _generate_explain_response(code: str, prompt: str, language: str) -> str:
    lines = []
    lines.append(f"## Code Explanation ({language.title()})\n")

    if code:
        # Analyze the code structure
        code_lines = code.strip().split("\n")
        lines.append(f"This code has **{len(code_lines)} lines**. Here's what it does:\n")

        # Detect common patterns
        if "def " in code or "function " in code:
            funcs = re.findall(r'(?:def|function)\s+(\w+)', code)
            if funcs:
                lines.append(f"**Functions defined:** {', '.join(f'`{f}()`' for f in funcs)}\n")
        if "class " in code:
            classes = re.findall(r'class\s+(\w+)', code)
            if classes:
                lines.append(f"**Classes defined:** {', '.join(f'`{c}`' for c in classes)}\n")
        if "for " in code or "while " in code:
            lines.append("**Loops:** The code uses iteration to process data repeatedly.\n")
        if "if " in code:
            lines.append("**Conditionals:** The code includes decision-making logic.\n")
        if "import " in code or "#include" in code:
            imports = re.findall(r'(?:import|from)\s+([\w.]+)', code)
            if imports:
                lines.append(f"**Imports:** {', '.join(f'`{i}`' for i in imports)}\n")
        if "return " in code:
            lines.append("**Returns:** The code produces output values via return statements.\n")

        lines.append("### Step-by-step breakdown:\n")
        for i, line in enumerate(list(code_lines)[:15], 1):  # type: ignore[index]
            stripped = line.strip()
            if stripped and not stripped.startswith("#") and not stripped.startswith("//"):
                lines.append(f"- **Line {i}:** `{stripped[:80]}` — Executes program logic\n")  # type: ignore[index]

        if len(code_lines) > 15:
            lines.append(f"- *(... and {len(code_lines) - 15} more lines)*\n")
    else:
        topic = prompt.lower()
        for concept, tip in LANGUAGE_TIPS.get(language, LANGUAGE_TIPS.get("python", {})).items():
            if concept in topic or any(word in topic for word in concept.split("-")):
                lines.append(f"### {concept.replace('-', ' ').title()}\n")
                lines.append(f"{tip}\n")
                break
        else:
            lines.append(f"### {prompt}\n")
            lines.append(_get_tip(language, prompt.split()[0] if prompt.split() else "basics"))
            lines.append("\n")

    lines.append(f"\n💡 **Tip:** {_get_tip(language, 'basics')}")
    return "\n".join(lines)


def _generate_debug_response(code: str, prompt: str, language: str) -> str:
    lines = [f"## Debug Analysis ({language.title()})\n"]

    if code:
        issues = []
        # Check common issues
        if language == "python":
            if "print " in code and "print(" not in code:
                issues.append("⚠️ **SyntaxError:** Use `print()` with parentheses (Python 3 syntax)")
            if code.count("(") != code.count(")"):
                issues.append("⚠️ **SyntaxError:** Mismatched parentheses")
            if code.count("[") != code.count("]"):
                issues.append("⚠️ **SyntaxError:** Mismatched square brackets")
            if "= =" in code:
                issues.append("⚠️ **SyntaxError:** Use `==` for comparison (no space between equals signs)")
            if "def " in code and "return" not in code:
                issues.append("⚠️ **Warning:** Function defined without a `return` statement")
            indent_errors = [l for l in code.split("\n") if l and not l[0].isspace() and l.strip().startswith(("return", "else", "elif", "except", "finally"))]
            if indent_errors:
                issues.append("⚠️ **IndentationError:** Some statements appear to have incorrect indentation")
        elif language in ("c", "cpp"):
            if code.count("{") != code.count("}"):
                issues.append("⚠️ **SyntaxError:** Mismatched curly braces")
            if ";" not in code and len(code.strip().split("\n")) > 1:
                issues.append("⚠️ **Warning:** Missing semicolons at end of statements")
        elif language == "java":
            if code.count("{") != code.count("}"):
                issues.append("⚠️ **SyntaxError:** Mismatched curly braces")
            if "public static void main" not in code and "class" in code:
                issues.append("ℹ️ **Note:** No main method found — this may be a utility class")

        if issues:
            lines.append("### Issues Found:\n")
            for issue in issues:
                lines.append(f"{issue}\n")
        else:
            lines.append("### No obvious syntax errors detected.\n")

        lines.append("\n### Debugging Tips:\n")
        lines.append(f"1. Add print/log statements to trace variable values\n")
        lines.append(f"2. Test with edge cases (empty input, boundary values)\n")
        lines.append(f"3. Check variable types and ensure correct data flow\n")
        lines.append(f"4. Verify loop conditions to prevent infinite loops\n")
    else:
        lines.append(f"**Problem:** {prompt}\n")
        lines.append("### Debugging Strategy:\n")
        lines.append("1. **Reproduce** the issue consistently\n")
        lines.append("2. **Isolate** the problematic section\n")
        lines.append("3. **Inspect** variable values at each step\n")
        lines.append("4. **Fix** the root cause, not just symptoms\n")
        lines.append("5. **Test** your fix with multiple inputs\n")

    return "\n".join(lines)


def _generate_code_response(prompt: str, language: str) -> str:
    lines = [f"## Generated Code ({language.title()})\n"]

    prompt_lower = prompt.lower()

    # Generate code based on common requests
    if "hello" in prompt_lower or "hello world" in prompt_lower:
        snippets = {
            "python": 'print("Hello, World!")',
            "c": '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
            "java": 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
            "cpp": '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
            "javascript": 'console.log("Hello, World!");',
        }
        lines.append(f"```{language}\n{snippets.get(language, snippets['python'])}\n```\n")
    elif "fibonacci" in prompt_lower:
        snippets = {
            "python": "def fibonacci(n):\n    if n <= 0:\n        return []\n    if n == 1:\n        return [0]\n    fib = [0, 1]\n    for i in range(2, n):\n        fib.append(fib[-1] + fib[-2])\n    return fib\n\nprint(fibonacci(10))",
            "c": '#include <stdio.h>\n\nvoid fibonacci(int n) {\n    int a = 0, b = 1, next;\n    for (int i = 0; i < n; i++) {\n        printf("%d ", a);\n        next = a + b;\n        a = b;\n        b = next;\n    }\n}\n\nint main() {\n    fibonacci(10);\n    return 0;\n}',
            "java": "public class Fibonacci {\n    public static void fibonacci(int n) {\n        int a = 0, b = 1;\n        for (int i = 0; i < n; i++) {\n            System.out.print(a + \" \");\n            int next = a + b;\n            a = b;\n            b = next;\n        }\n    }\n    public static void main(String[] args) {\n        fibonacci(10);\n    }\n}",
            "cpp": "#include <iostream>\nusing namespace std;\n\nvoid fibonacci(int n) {\n    int a = 0, b = 1;\n    for (int i = 0; i < n; i++) {\n        cout << a << \" \";\n        int next = a + b;\n        a = b;\n        b = next;\n    }\n}\n\nint main() {\n    fibonacci(10);\n    return 0;\n}",
            "javascript": "function fibonacci(n) {\n    const fib = [0, 1];\n    for (let i = 2; i < n; i++) {\n        fib.push(fib[i-1] + fib[i-2]);\n    }\n    return fib.slice(0, n);\n}\nconsole.log(fibonacci(10));",
        }
        lines.append(f"```{language}\n{snippets.get(language, snippets['python'])}\n```\n")
    elif "sort" in prompt_lower:
        snippets = {
            "python": "def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr\n\nprint(bubble_sort([64, 34, 25, 12, 22, 11, 90]))",
            "java": "import java.util.Arrays;\n\npublic class Sort {\n    public static void bubbleSort(int[] arr) {\n        int n = arr.length;\n        for (int i = 0; i < n-1; i++)\n            for (int j = 0; j < n-i-1; j++)\n                if (arr[j] > arr[j+1]) {\n                    int temp = arr[j];\n                    arr[j] = arr[j+1];\n                    arr[j+1] = temp;\n                }\n    }\n    public static void main(String[] args) {\n        int[] arr = {64, 34, 25, 12, 22, 11, 90};\n        bubbleSort(arr);\n        System.out.println(Arrays.toString(arr));\n    }\n}",
        }
        lines.append(f"```{language}\n{snippets.get(language, snippets.get('python', '# Sort implementation'))}\n```\n")
    else:
        lines.append(f"Here's a template to solve: **{prompt}**\n")
        if language == "python":
            lines.append(f"```python\n# Solution for: {prompt}\n\ndef solve():\n    # TODO: Implement your solution\n    pass\n\nif __name__ == '__main__':\n    solve()\n```\n")
        elif language == "c":
            lines.append(f"```c\n#include <stdio.h>\n\n// Solution for: {prompt}\nint main() {{\n    // TODO: Implement\n    return 0;\n}}\n```\n")
        elif language == "java":
            lines.append(f"```java\npublic class Solution {{\n    // Solution for: {prompt}\n    public static void main(String[] args) {{\n        // TODO: Implement\n    }}\n}}\n```\n")
        elif language == "cpp":
            lines.append(f"```cpp\n#include <iostream>\nusing namespace std;\n\n// Solution for: {prompt}\nint main() {{\n    // TODO: Implement\n    return 0;\n}}\n```\n")
        elif language == "javascript":
            lines.append(f"```javascript\n// Solution for: {prompt}\nfunction solve() {{\n    // TODO: Implement\n}}\nsolve();\n```\n")

    lines.append(f"\n💡 **Key concept:** {_get_tip(language, 'functions')}")
    return "\n".join(lines)


def _generate_optimize_response(code: str, prompt: str, language: str) -> str:
    lines = [f"## Optimization Suggestions ({language.title()})\n"]

    if code:
        lines.append("### Analysis:\n")

        code_lines = code.strip().split("\n")
        lines.append(f"- **Lines of code:** {len(code_lines)}\n")

        # Detect optimization opportunities
        suggestions = []
        first_for = code.index("for ") if "for " in code else -1
        if first_for >= 0 and "for " in code[first_for + 4:]:  # type: ignore[index]
            suggestions.append("🔄 **Nested loops detected** — Consider using hash maps or built-in functions to reduce time complexity from O(n²) to O(n)")
        if language == "python":
            if "append" in code and "for " in code:
                suggestions.append("📝 **List building in loop** — Consider using list comprehension for better performance and readability")
            if "+ " in code and "str" in code.lower():
                suggestions.append("🔗 **String concatenation** — Use `''.join()` or f-strings instead of `+` for better performance")
            if "global " in code:
                suggestions.append("🌐 **Global variables** — Consider passing values as parameters instead of using globals")
        if "== True" in code or "== False" in code:
            suggestions.append("✨ **Boolean comparison** — Use `if x:` instead of `if x == True:`")

        if suggestions:
            lines.append("### Optimization Opportunities:\n")
            for s in suggestions:
                lines.append(f"{s}\n")
        else:
            lines.append("### Code looks reasonably optimized!\n")

        lines.append("\n### General Best Practices:\n")
        lines.append("1. Use appropriate data structures (dict for lookups, set for uniqueness)\n")
        lines.append("2. Avoid unnecessary computations inside loops\n")
        lines.append("3. Cache repeated calculations\n")
        lines.append("4. Profile before optimizing — measure, don't guess\n")
    else:
        lines.append(f"**Request:** {prompt}\n")
        lines.append(_get_tip(language, "data-structures"))

    return "\n".join(lines)


def _generate_review_response(code: str, prompt: str, language: str) -> str:
    lines = [f"## Code Review ({language.title()})\n"]

    if code:
        code_lines = code.strip().split("\n")

        # Scoring criteria
        issues = []
        good = []

        # Check naming conventions
        if language == "python":
            if re.search(r'def [A-Z]', code):
                issues.append("🏷️ **Naming:** Python functions should use `snake_case`, not `CamelCase`")
            else:
                good.append("✅ **Naming conventions** look correct")
        elif language in ("java", "cpp", "javascript"):
            if re.search(r'class [a-z]', code):
                issues.append("🏷️ **Naming:** Class names should use `PascalCase`")

        # Check documentation
        if language == "python" and '"""' not in code and "'''" not in code and "# " not in code:
            issues.append("📝 **Documentation:** Add docstrings to functions and comments for complex logic")
        elif ("/*" not in code and "//" not in code and "#" not in code):
            issues.append("📝 **Documentation:** Consider adding comments to explain complex logic")
        else:
            good.append("✅ **Documentation** is present")

        # Check error handling
        if language == "python" and "try" not in code:
            issues.append("🛡️ **Error handling:** Consider adding try/except blocks for robust code")
        elif language in ("java", "cpp", "javascript") and "try" not in code:
            issues.append("🛡️ **Error handling:** Consider adding try/catch blocks")

        if len(code_lines) < 50:
            good.append("✅ **Code length** is manageable")
        else:
            issues.append("📏 **Length:** Consider breaking this into smaller functions")

        lines.append("### ✅ What's Good:\n")
        for g in good:
            lines.append(f"{g}\n")

        if issues:
            lines.append("\n### ⚠️ Improvements Needed:\n")
            for issue in issues:
                lines.append(f"{issue}\n")

        lines.append("\n### 📊 Overall Assessment:\n")
        score = max(0, 10 - len(issues) * 2)
        lines.append(f"**Score: {score}/10**\n")
    else:
        lines.append(f"**Review request:** {prompt}\n")
        lines.append(_get_tip(language, "functions"))

    return "\n".join(lines)


class MentorService:
    """Centralized service for mentor operations — fully self-contained, no LLM required."""

    def __init__(self, model_name: str = "built-in"):
        self.learner_id: Optional[int] = None

    def set_learner(self, learner_id: int) -> None:
        self.learner_id = learner_id

    def get_learner_context_block(self) -> str:
        if not self.learner_id:
            return ""
        profile = db.get_learner_profile(self.learner_id)
        if not profile:
            return ""
        preferred_languages = db.parse_text_list(profile.get("preferred_languages"))
        context_lines = [
            f"### Learner Context",
            f"**Goals:** {profile.get('goals') or 'Not set'}",
            f"**Preferred Languages:** {', '.join(lang.title() for lang in preferred_languages) or 'None'}",
        ]
        mistakes = db.get_recent_mistakes(self.learner_id, limit=3)
        if mistakes:
            context_lines.append("**Recent Mistake Patterns:**")
            for mistake in mistakes:
                context_lines.append(f"  - {mistake['mistake_type']}: {mistake['description']}")
        return "\n".join(context_lines) + "\n\n"

    def stream_chat(self, mode: str, code: str, language: Optional[str] = None,
                    prompt: Optional[str] = None, session_id: Optional[int] = None,
                    challenge_attempt_id: Optional[int] = None) -> Iterator[str]:
        if not code and not prompt:
            yield "Error: Code or prompt is required"
            return

        language = db.normalize_language_name(language) or "python"
        code = (code or "").strip()
        prompt = (prompt or "").strip()

        # Log event
        if session_id and self.learner_id:
            code_summary: str = (code[:200] + "...") if len(code) > 200 else code  # type: ignore[index]
            prompt_summary: str = (prompt[:200] + "...") if len(prompt) > 200 else prompt  # type: ignore[index]
            db.log_event(session_id, f"{mode}_request", {
                "code": code_summary,
                "prompt": prompt_summary,
                "language": language,
                "challenge_attempt_id": challenge_attempt_id,
            })

        # Generate response based on mode
        try:
            if mode == "explain":
                response = _generate_explain_response(code, prompt, language)
            elif mode == "debug":
                response = _generate_debug_response(code, prompt, language)
            elif mode == "generate":
                response = _generate_code_response(prompt or code, language)
            elif mode == "optimize":
                response = _generate_optimize_response(code, prompt, language)
            elif mode == "review":
                response = _generate_review_response(code, prompt, language)
            else:
                response = f"Unknown mode '{mode}'. Available modes: explain, debug, generate, optimize, review"

            # Stream response in chunks to simulate LLM streaming
            words = response.split(" ")
            chunk = ""
            for i, word in enumerate(words):
                chunk += word + " "
                if len(chunk) > 40 or i == len(words) - 1:
                    yield chunk
                    chunk = ""

            if session_id and self.learner_id:
                db.log_event(session_id, f"{mode}_response", {
                    "mode": mode,
                    "challenge_attempt_id": challenge_attempt_id,
                })

        except Exception as e:
            yield f"\n[Error]: {str(e)}"

    def classify_mistakes(self, code: str, language: str, feedback: str) -> List[Dict[str, Any]]:
        return self._heuristic_classify_mistakes(code, language, feedback)

    def _heuristic_classify_mistakes(self, code: str, language: str, feedback: str) -> List[Dict[str, Any]]:
        mistakes = []
        feedback_lower = feedback.lower()

        if any(kw in feedback_lower for kw in ["syntax", "invalid syntax", "unexpected", "missing colon", "indentation"]):
            mistakes.append({"mistake_type": "syntax", "description": "Syntax error detected", "suggestion": "Check for missing colons, incorrect indentation, or invalid syntax", "confidence": 0.7})
        if any(kw in feedback_lower for kw in ["logic", "wrong output", "incorrect", "algorithm"]):
            mistakes.append({"mistake_type": "logic", "description": "Logic error detected", "suggestion": "Review the algorithm and test with different inputs", "confidence": 0.6})
        if any(kw in feedback_lower for kw in ["error", "exception", "traceback", "runtime", "failed"]):
            mistakes.append({"mistake_type": "runtime", "description": "Runtime error detected", "suggestion": "Check error messages and handle edge cases", "confidence": 0.8})
        if any(kw in feedback_lower for kw in ["concept", "understand", "best practice", "consider"]):
            mistakes.append({"mistake_type": "conceptual", "description": "Conceptual issue", "suggestion": "Review the underlying concepts", "confidence": 0.5})
        if not mistakes:
            mistakes.append({"mistake_type": "debugging-strategy", "description": "General debugging needed", "suggestion": "Test thoroughly and trace through the code logic", "confidence": 0.4})

        return mistakes

    def evaluate_challenge_attempt(self, attempt: Dict[str, Any], template: Dict[str, Any]) -> Dict[str, Any]:
        code = attempt["code"]
        language = attempt["language"]
        prompt_text = template.get("prompt", "")

        # Simple heuristic evaluation
        score = 0.5
        feedback_parts = []
        passed = False

        if not code.strip():
            return {"passed": False, "rubric_score": 0.0, "feedback": "No code submitted.", "mistakes": []}

        code_lower = code.lower()
        lines = code.strip().split("\n")
        non_empty = [l for l in lines if l.strip() and not l.strip().startswith("#") and not l.strip().startswith("//")]

        # Check code is non-trivial
        if len(non_empty) >= 2:
            score += 0.1
            feedback_parts.append("Code has meaningful content.")

        if len(non_empty) >= 5:
            score += 0.1

        # Check for function/class definitions
        if "def " in code or "function " in code or "void " in code or "int " in code:
            score += 0.1
            feedback_parts.append("Good use of functions/methods.")

        # Check for comments
        if "#" in code or "//" in code or "/*" in code:
            score += 0.05
            feedback_parts.append("Nice code documentation.")

        # Check if key concepts from prompt are addressed
        prompt_keywords = re.findall(r'\b\w{4,}\b', prompt_text.lower())
        matches = sum(1 for kw in prompt_keywords if kw in code_lower)
        if matches > 2:
            score += 0.15
            feedback_parts.append("Solution addresses the challenge requirements.")

        # Check for output (print/console.log/System.out)
        if any(kw in code for kw in ["print(", "console.log(", "System.out", "printf(", "cout"]):
            score += 0.05

        # Check for return statements (for function challenges)
        if "return " in code and "def " in code:
            score += 0.1
            feedback_parts.append("Function returns a value as expected.")

        score = min(1.0, score)
        passed = score >= 0.6

        if passed:
            feedback_parts.insert(0, "✅ Great job! Your solution looks good.")
        else:
            feedback_parts.insert(0, "Keep trying! Your solution needs some improvements.")
            feedback_parts.append("Try to address all requirements from the challenge prompt.")

        mistakes = self._heuristic_classify_mistakes(code, language, " ".join(feedback_parts))

        rubric_score: float = float(round(score * 100)) / 100
        return {
            "passed": passed,
            "rubric_score": rubric_score,
            "feedback": " ".join(feedback_parts),
            "mistakes": mistakes if not passed else []
        }

    def generate_next_recommendation(self, learner_id: int) -> Optional[Dict[str, Any]]:
        if learner_id != self.learner_id:
            self.set_learner(learner_id)

        profile = db.get_learner_profile(learner_id)
        if not profile:
            return None

        preferred_languages = db.parse_text_list(profile.get("preferred_languages"))
        current_language = db.normalize_language_name(profile.get("current_language")) or "python"

        language_priority: List[str] = []
        for language in [current_language, *preferred_languages]:
            normalized = db.normalize_language_name(language)
            if normalized and normalized not in language_priority:
                language_priority.append(normalized)

        challenges: List[Dict[str, Any]] = []
        for lang in language_priority:
            results: List[Dict[str, Any]] = db.get_challenge_templates(language=lang)
            challenges.extend(results)
        if not challenges:
            all_challenges: List[Dict[str, Any]] = db.get_challenge_templates()
            challenges = all_challenges
        if not challenges:
            return None

        completed_ids = set(db.get_completed_challenge_ids(learner_id))
        incomplete = [c for c in challenges if c["id"] not in completed_ids]
        if incomplete:
            challenges = incomplete

        proficiencies = db.get_language_proficiencies(learner_id)
        prof_by_lang = {p["language"]: p for p in proficiencies}

        best_challenge = None
        best_score = -1

        for challenge in challenges:
            score = 0.5
            proficiency = prof_by_lang.get(challenge["language"])
            target = "easy"
            if proficiency:
                if proficiency["score"] >= 0.75:
                    target = "hard"
                elif proficiency["score"] >= 0.45:
                    target = "medium"
            if challenge["difficulty"] == target:
                score += 0.2
            if challenge["language"] == current_language:
                score += 0.1
            if score > best_score:
                best_score = score
                best_challenge = challenge

        if best_challenge is not None:
            return best_challenge
        return challenges[0] if challenges else None

    def generate_personalized_hint(self, assignment_id: int, draft_code: Optional[str] = None) -> str:
        assignment = db.get_challenge_assignment(assignment_id)
        if not assignment:
            return "Hint not available"

        template = db.get_challenge_template(assignment["challenge_id"])
        if not template:
            return "Hint not available"

        hint_templates_str = template.get("hint_templates", "[]")
        try:
            hints = json.loads(hint_templates_str)
        except Exception:
            hints = []

        if not hints:
            return "Try breaking the problem into smaller steps."

        # Return first unused hint based on attempt count
        latest = db.get_latest_attempt_for_assignment(assignment_id)
        attempt_num = latest.get("attempt_number", 0) if latest else 0
        idx = min(attempt_num, len(hints) - 1)
        return hints[idx]


_service_instance = None


def get_mentor_service(model_name: str = "built-in") -> MentorService:
    global _service_instance
    if _service_instance is None:
        _service_instance = MentorService(model_name)
    return _service_instance
