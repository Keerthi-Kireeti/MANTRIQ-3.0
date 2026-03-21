/**
 * Comprehensive Lesson Content Library
 * Maps (language, topicName) to { explanation, codeExample, exercise }
 * Language names match syllabusData.ts: "Python", "JavaScript", "C", "Java", "C++", "TypeScript", "C#", "Go", "Rust", "Ruby"
 */

export interface LessonContent {
  explanation: string;
  codeExample: string;
  exercise: string;
}

function lesson(explanation: string, codeExample: string, exercise: string): LessonContent {
  return { explanation, codeExample, exercise };
}

function normalizeTopic(topicName: string): string {
  return topicName.toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

export function getLessonContent(language: string, topicName: string): LessonContent | null {
  const langKey = language.toLowerCase();
  const topicKey = normalizeTopic(topicName);
  
  // Try exact match first
  const key = `${langKey}::${topicKey}`;
  if (LESSONS[key]) return LESSONS[key];
  
  // Try partial match
  for (const lessonKey of Object.keys(LESSONS)) {
    if (lessonKey.startsWith(`${langKey}::`) && topicKey.includes(lessonKey.split("::")[1])) {
      return LESSONS[lessonKey];
    }
  }
  
  // Try common aliases
  const aliases: Record<string, string> = {
    "setup & first program": "setup & repl",
    "first program": "first c program",
    "data types": "primitive data types",
    "oop": "classes & objects",
    "functions & modules": "functions",
    "async": "async/await",
  };
  
  for (const [alias, target] of Object.entries(aliases)) {
    if (topicKey.includes(alias)) {
      const aliasedKey = `${langKey}::${target}`;
      if (LESSONS[aliasedKey]) return LESSONS[aliasedKey];
    }
  }
  
  return null;
}

// =============================================================================
// PYTHON LESSONS
// =============================================================================

const PYTHON_LESSONS: Record<string, LessonContent> = {

  "python-setup-repl": lesson(
    `# Python Setup & REPL

Python is a high-level, interpreted programming language known for its simplicity and readability. Let's set up your Python environment!

## Installing Python

### Windows:
1. Visit https://python.org
2. Download the latest Python 3.x installer
3. **Important:** Check "Add Python to PATH"
4. Run installer

### macOS:
\`\`\`bash
# Using Homebrew
brew install python3
\`\`\`

### Linux:
\`\`\`bash
sudo apt install python3 python3-pip
\`\`\`

## Virtual Environments

Virtual environments keep your project dependencies isolated:

\`\`\`bash
# Create a virtual environment
python3 -m venv myenv

# Activate it
# On Windows:
myenv\\Scripts\\activate
# On macOS/Linux:
source myenv/bin/activate

# Install packages
pip install package-name
\`\`\`

## Using the REPL

The REPL (Read-Eval-Print Loop) lets you run Python code interactively:

\`\`\`python
>>> print("Hello, World!")
Hello, World!
>>> 2 + 2
4
>>> name = "Python"
>>> f"Welcome to {name}!"
'Welcome to Python!'
\`\`\`

## Running Python Files

\`\`\`bash
# Run a Python script
python3 myscript.py
\`\`\`

## Key Concepts

1. **No semicolons needed** - Python uses newlines
2. **Indentation matters** - Use 4 spaces (or tab)
3. **Case sensitive** - \`Variable\` ≠ \`variable\``,
    `print("Hello, World!")
name = input("Enter name: ")
print(f"Hello, {name}!")`,
    "Write a program that asks for your name and favorite programming language, then prints a greeting."
  ),

  "variables-data-types": lesson(
    `# Variables & Data Types in Python

Variables are containers for storing data values. Python is dynamically typed, so you don't need to declare variable types.

## Variable Assignment

\`\`\`python
name = "Alice"           # String
age = 25                # Integer
height = 5.9            # Float
is_student = True       # Boolean
nothing = None          # None (null)

# Multiple assignment
x, y, z = 1, 2, 3
\`\`\`

## Python Data Types

### Numbers
\`\`\`python
# Integers (int)
count = 42
negative = -10

# Floats (float)
price = 19.99
scientific = 2.5e-3  # 0.0025

# Complex numbers
complex_num = 3 + 4j
\`\`\`

### Strings (str)
\`\`\`python
greeting = "Hello"
name = 'Alice'

# Multi-line strings
text = """
This is a
multi-line
string
"""

# f-strings (formatted strings)
message = f"My name is {name} and I am {age} years old"
\`\`\`

### Booleans (bool)
\`\`\`python
is_valid = True
is_empty = False
\`\`\`

## Type Checking & Conversion

\`\`\`python
# Check type
type(42)        # <class 'int'>
type(3.14)      # <class 'float'>

# Convert types
int(3.7)        # 3
float("3.14")   # 3.14
str(42)         # "42"
bool(1)         # True
bool(0)         # False
\`\`\``,
    `name = "Python"
version = 3.12
is_popular = True
print(f"{name} {version} is popular: {is_popular}")

# Type conversion
age_str = "25"
age_int = int(age_str)
print(f"Age: {age_int}, Type: {type(age_int)}")`,
    "Create variables for a book (title, author, year, rating) and print a formatted description."
  ),

  "operators-expressions": lesson(
    `# Operators & Expressions in Python

Operators are special symbols that perform operations on values and variables.

## Arithmetic Operators

\`\`\`python
a, b = 10, 3

print(a + b)   # 13 - Addition
print(a - b)   # 7  - Subtraction
print(a * b)   # 30 - Multiplication
print(a / b)   # 3.333... - Division
print(a // b)  # 3  - Floor Division
print(a % b)   # 1  - Modulus (remainder)
print(a ** b)  # 1000 - Exponentiation
\`\`\`

## Comparison Operators

\`\`\`python
x, y = 5, 10

print(x == y)   # False - Equal
print(x != y)   # True  - Not equal
print(x < y)    # True  - Less than
print(x > y)    # False - Greater than
print(x <= y)   # True  - Less than or equal
print(x >= y)   # False - Greater than or equal
\`\`\`

## Logical Operators

\`\`\`python
a, b = True, False

print(a and b)  # False
print(a or b)   # True
print(not a)    # False
\`\`\`

## Assignment Operators

\`\`\`python
x = 10
x += 5          # x = 15
x -= 3          # x = 12
x *= 2          # x = 24
x /= 4          # x = 6.0
\`\`

## Walrus Operator (:=) - Python 3.8+

\`\`\`python
if (n := len(data)) > 10:
    print(f"List is too long with {n} elements")
\`\`\``,
    `# Calculate area of rectangle
length = 10
width = 5
area = length * width
perimeter = 2 * (length + width)
print(f"Area: {area}, Perimeter: {perimeter}")`,
    "Create a calculator that computes the area of a circle and the volume of a sphere given a radius."
  ),

  "string-operations": lesson(
    `# String Operations in Python

Strings are sequences of characters. Python provides rich string manipulation capabilities.

## Creating Strings

\`\`\`python
s1 = 'Hello'
s2 = "World"

s3 = """This is
a multi-line
string"""

path = "C:\\\\Users\\\\Name"
\`\`\`

## String Slicing

\`\`\`python
text = "Hello, World!"

print(text[0])        # H
print(text[0:5])      # Hello
print(text[7:])       # World!
print(text[-1])       # !
print(text[::2])      # Hlo ol!
print(text[::-1])     # !dlroW ,olleH (reversed)
\`\`\`

## String Methods

\`\`\`python
s = "  Hello, Python!  "

s.upper()             # "  HELLO, PYTHON!  "
s.lower()             # "  hello, python!  "
s.strip()             # "Hello, Python!"
s.replace("Python", "World")
s.split(",")          # ["  Hello", " Python!  "]
s.count("l")          # 3
s.find("Python")      # 7
\`\`\`

## f-Strings

\`\`\`python
name = "Alice"
age = 30

# Basic
print(f"My name is {name} and I am {age}")

# Expressions
print(f"In 5 years: {age + 5}")

# Format specifiers
pi = 3.14159
print(f"Pi: {pi:.2f}")   # Pi: 3.14
\`\`\``,
    `# String manipulation examples
text = "Python Programming"
print(text.upper())
print(text.lower())
print(text[0:6])
print(text.replace("Programming", "Development"))

# f-string formatting
name = "Alice"
age = 30
print(f"{name} is {age} years old")`,
    "Take a sentence and perform: reverse it, count vowels, find a substring, and format it with a name."
  ),

  "conditionals": lesson(
    `# Conditionals in Python

Conditionals allow your program to make decisions based on conditions.

## if Statement

\`\`\`python
age = 18

if age >= 18:
    print("You are an adult")
\`\`\`

## if-else Statement

\`\`\`python
temperature = 25

if temperature > 30:
    print("It's hot!")
else:
    print("It's comfortable")
\`\`\`

## if-elif-else Chain

\`\`\`python
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Grade: {grade}")
\`\`\`

## Ternary Operator

\`\`\`python
age = 20
status = "adult" if age >= 18 else "minor"
\`\`\`

## Match Statement (Python 3.10+)

\`\`\`python
status_code = 404

match status_code:
    case 200:
        print("OK")
    case 404:
        print("Not Found")
    case _:
        print("Unknown status")
\`\`\``,
    `# Grade calculator
score = 87

if score >= 90:
    print("A - Excellent!")
elif score >= 80:
    print("B - Good job!")
elif score >= 70:
    print("C - Average")
elif score >= 60:
    print("D - Passed")
else:
    print("F - Need improvement")`,
    "Write a program that checks if a year is a leap year. A year is a leap year if divisible by 4, except centuries unless also divisible by 400."
  ),

  "loops": lesson(
    `# Loops in Python

Loops allow you to execute a block of code multiple times.

## for Loop

\`\`\`python
# Loop through a range
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# Loop through a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# Loop with index
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")
\`\`\`

## while Loop

\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1
\`\`\`

## Loop Control

\`\`\`python
# break - Exit loop early
for i in range(10):
    if i == 5:
        break
    print(i)  # 0, 1, 2, 3, 4

# continue - Skip iteration
for i in range(5):
    if i == 2:
        continue
    print(i)  # 0, 1, 3, 4

# else clause
for i in range(3):
    print(i)
else:
    print("Loop completed!")
\`\`\`

## Nested Loops

\`\`\`python
for i in range(3):
    for j in range(3):
        print(f"({i}, {j})", end=" ")
    print()
\`\`\``,
    `# Print multiplication table
for i in range(1, 6):
    for j in range(1, 6):
        print(f"{i*j:3}", end=" ")
    print()

# Sum using while loop
n = 5
total = 0
while n > 0:
    total += n
    n -= 1
print(f"Sum of 1-5: {total}")`,
    "Write a program that finds all prime numbers up to a given number using a loop."
  ),

  "comprehensions": lesson(
    `# List, Dict & Set Comprehensions

Comprehensions provide a concise way to create collections.

## List Comprehension

\`\`\`python
squares = [x**2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

evens = [x for x in range(10) if x % 2 == 0]
# [0, 2, 4, 6, 8]

matrix = [[i*j for j in range(3)] for i in range(3)]
# [[0, 0, 0], [0, 1, 2], [0, 2, 4]]
\`\`\`

## Dictionary Comprehension

\`\`\`python
squares_dict = {x: x**2 for x in range(5)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

keys = ['a', 'b', 'c']
values = [1, 2, 3]
combined = {k: v for k, v in zip(keys, values)}
# {'a': 1, 'b': 2, 'c': 3}
\`\`\`

## Set Comprehension

\`\`\`python
numbers = [1, 2, 2, 3, 3, 3, 4]
unique_squares = {x**2 for x in numbers}
# {1, 4, 9, 16}
\`\`\``,
    `# Examples
evens = [x**2 for x in range(10) if x % 2 == 0]
print(f"Even squares: {evens}")

words = ['hello', 'world', 'python']
lengths = {word: len(word) for word in words}
print(f"Word lengths: {lengths}")

names = ['Alice', 'Bob', 'Anna', 'Brian']
first_chars = {name[0] for name in names}
print(f"First chars: {first_chars}")`,
    "Use comprehensions to filter and transform a list of temperatures from Celsius to Fahrenheit, keeping only valid values."
  ),

  "exception-handling": lesson(
    `# Exception Handling in Python

Exceptions handle errors gracefully and prevent program crashes.

## try-except Block

\`\`\`python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero!")
\`\`\`

## Catching Multiple Exceptions

\`\`\`python
try:
    num = int(input("Enter a number: "))
    result = 10 / num
except ValueError:
    print("Invalid input - not a number")
except ZeroDivisionError:
    print("Cannot divide by zero")
\`\`\`

## else and finally

\`\`\`python
try:
    num = int("42")
except ValueError:
    print("Invalid number")
else:
    print(f"Success: {num}")  # Runs only if no exception
finally:
    print("Cleanup code runs regardless")
\`\`\`

## Raising Exceptions

\`\`\`python
def divide(a, b):
    if b == 0:
        raise ValueError("Cannot divide by zero!")
    return a / b
\`\`\``,
    `# Safe division function
def safe_divide(a, b):
    try:
        result = a / b
        return result
    except ZeroDivisionError:
        return float('inf')
    except TypeError:
        return None

print(safe_divide(10, 2))  # 5.0
print(safe_divide(10, 0))  # inf
print(safe_divide(10, "a")) # None`,
    "Create a function that safely parses user input and handles various error cases."
  ),

  "lists": lesson(
    `# Lists in Python

Lists are ordered, mutable collections that can hold items of any type.

## Creating Lists

\`\`\`python
empty = []
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]
nested = [[1, 2], [3, 4]]
\`\`\`

## Accessing Elements

\`\`\`python
fruits = ["apple", "banana", "cherry", "date"]

print(fruits[0])     # apple
print(fruits[-1])    # date
print(fruits[1:3])   # ['banana', 'cherry']
\`\`\`

## Modifying Lists

\`\`\`python
fruits = ["apple", "banana"]

fruits.append("cherry")     # Add to end
fruits.insert(1, "orange") # Insert at index
fruits.extend(["grape", "melon"])  # Add multiple
fruits[0] = "apricot"       # Modify
fruits.remove("banana")       # Remove by value
popped = fruits.pop()        # Remove & return last
\`\`\`

## List Methods

\`\`\`python
numbers = [3, 1, 4, 1, 5, 9, 2, 6]

numbers.sort()
numbers.reverse()
index = numbers.index(4)
count = numbers.count(1)
\`\`\``,
    `# List operations
fruits = ["apple", "banana", "cherry"]
fruits.append("date")
fruits.insert(1, "orange")
print(f"List: {fruits}")
print(f"Length: {len(fruits)}")
print(f"Sorted: {sorted(fruits)}")

# List comprehension
squares = [x**2 for x in range(5)]
print(f"Squares: {squares}")`,
    "Create a to-do list manager with add, remove, complete, and display functions."
  ),

  "dictionaries": lesson(
    `# Dictionaries in Python

Dictionaries store key-value pairs and provide fast lookup by key.

## Creating Dictionaries

\`\`\`python
person = {
    "name": "Alice",
    "age": 30,
    "city": "New York"
}

# From sequences
keys = ["name", "age", "city"]
values = ["Bob", 25, "Boston"]
person2 = dict(zip(keys, values))
\`\`\`

## Accessing & Modifying

\`\`\`python
print(person["name"])      # Alice
print(person.get("job", "Unknown"))

person["age"] = 31
person["job"] = "Developer"
del person["city"]
\`\`\`

## Dictionary Methods

\`\`\`python
person.keys()     # dict_keys(['name', 'age', 'job'])
person.values()   # dict_values(['Alice', 31, 'Developer'])
person.items()   # dict_items([('name', 'Alice'), ...])
person.update({"country": "USA"})
\`\`\`

## defaultdict

\`\`\`python
from collections import defaultdict

word_lengths = defaultdict(list)
word_lengths["python"].append(6)
print(word_lengths["ruby"])  # [] - auto-created
\`\`\``,
    `from collections import Counter

sentence = "the quick brown fox jumps over the lazy dog the fox"
words = sentence.split()
freq = Counter(words)

print("Word frequencies:")
for word, count in freq.items():
    print(f"{word}: {count}")

print(f"\nMost common: {freq.most_common(3)}")`,
    "Create a word frequency counter that counts occurrences of each word in a sentence."
  ),

  "functions": lesson(
    `# Functions in Python

Functions are reusable blocks of code that perform specific tasks.

## Defining Functions

\`\`\`python
def greet():
    """Docstring - describes the function"""
    print("Hello, World!")

greet()
\`\`\`

## Parameters & Arguments

\`\`\`python
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")

def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Bob")
greet("Carol", "Hi")
\`\`\`

## *args and **kwargs

\`\`\`python
def sum_all(*numbers):
    return sum(numbers)

print(sum_all(1, 2, 3, 4, 5))

def print_info(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=30, city="NYC")
\`\`\`

## Return Values

\`\`\`python
def add(a, b):
    return a + b

def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers)

low, high, total = get_stats([1, 2, 3, 4, 5])
\`\`\``,
    `# Function examples
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(f"5! = {factorial(5)}")

def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Alice"))
print(greet("Bob", "Hi"))`,
    "Write a function that calculates the BMI and returns the category."
  ),

  "lambda-higher-order": lesson(
    `# Lambda & Higher-Order Functions

Lambda functions and higher-order functions enable functional programming patterns.

## Lambda Functions

\`\`\`python
square = lambda x: x ** 2
multiply = lambda x, y: x * y
print(square(5))
print(multiply(3, 4))
\`\`\`

## Higher-Order Functions

### map()
\`\`\`python
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x ** 2, numbers))
# [1, 4, 9, 16, 25]
\`\`\`

### filter()
\`\`\`python
evens = list(filter(lambda x: x % 2 == 0, numbers))
# [2, 4]
\`\`\`

### reduce()
\`\`\`python
from functools import reduce

total = reduce(lambda x, y: x + y, numbers)
# 15
\`\`\`

## Closures

\`\`\`python
def multiplier(n):
    return lambda x: x * n

double = multiplier(2)
triple = multiplier(3)
print(double(5))   # 10
print(triple(5))   # 15
\`\`\``,
    `from functools import reduce

numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Filter even numbers
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(f"Evens: {evens}")

# Square each number
squared = list(map(lambda x: x ** 2, evens))
print(f"Squared: {squared}")

# Sum of squares
total = reduce(lambda a, b: a + b, squared)
print(f"Sum: {total}")`,
    "Use map, filter, and reduce to process a list of student scores."
  ),

  "generators-iterators": lesson(
    `# Generators & Iterators

Generators create iterators that yield values lazily (one at a time).

## Iterators vs Iterables

\`\`\`python
my_list = [1, 2, 3]
for item in my_list:
    print(item)

my_iter = iter(my_list)
print(next(my_iter))  # 1
print(next(my_iter))  # 2
\`\`\`

## Generator Functions

\`\`\`python
def count_up_to(n):
    count = 1
    while count <= n:
        yield count
        count += 1

counter = count_up_to(5)
for num in counter:
    print(num)  # 1, 2, 3, 4, 5
\`\`\`

## Benefits of Generators

1. **Memory efficient** - Don't load everything
2. **Lazy evaluation** - Generate on-demand
3. **Infinite sequences**

\`\`\`python
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
for _ in range(10):
    print(next(fib), end=" ")
# 0 1 1 2 3 5 8 13 21 34
\`\`\``,
    `# Generator examples
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print("Fibonacci sequence:")
for num in fibonacci(10):
    print(num, end=" ")
print()

# Generator expression
squares_gen = (x**2 for x in range(100))
print(f"First 5 squares: {list(next(squares_gen) for _ in range(5))}")`,
    "Create a generator that yields prime numbers up to a limit."
  ),

  "classes-objects": lesson(
    `# Classes & Objects in Python

Classes define blueprints for creating objects with attributes and methods.

## Defining a Class

\`\`\`python
class Dog:
    species = "Canis familiaris"
    
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def bark(self):
        return f"{self.name} says Woof!"
    
    def __str__(self):
        return f"{self.name} is {self.age} years old"
\`\`\`

## Creating Objects

\`\`\`python
buddy = Dog("Buddy", 3)
print(buddy.name)
print(buddy.bark())
print(buddy)
\`\`\`

## Class Methods vs Instance Methods

\`\`\`python
class Counter:
    def __init__(self):
        self.count = 0
    
    def increment(self):
        self.count += 1
        return self.count
\`\`\``,
    `# Class example
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height
    
    def perimeter(self):
        return 2 * (self.width + self.height)

rect = Rectangle(5, 3)
print(f"Area: {rect.area()}")
print(f"Perimeter: {rect.perimeter()}")`,
    "Create a BankAccount class with deposit, withdraw, and balance inquiry methods."
  ),

  "inheritance": lesson(
    `# Inheritance in Python

Inheritance allows a class to inherit attributes and methods from another class.

## Single Inheritance

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        return "Some sound"

class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"

dog = Dog("Buddy")
cat = Cat("Whiskers")
print(dog.speak())
print(cat.speak())
\`\`\`

## The super() Function

\`\`\`python
class Vehicle:
    def __init__(self, brand):
        self.brand = brand

class Car(Vehicle):
    def __init__(self, brand, model):
        super().__init__(brand)
        self.model = model
\`\`\`

## Method Resolution Order (MRO)

\`\`\`python
class D(B, C):
    pass

print(D.__mro__)  # See inheritance order
\`\`\``,
    `# Inheritance example
class Shape:
    def __init__(self, color="black"):
        self.color = color
    
    def describe(self):
        return f"A {self.color} shape"

class Rectangle(Shape):
    def __init__(self, width, height, color="black"):
        super().__init__(color)
        self.width = width
        self.height = height
    
    def area(self):
        return self.width * self.height

class Square(Rectangle):
    def __init__(self, side, color="black"):
        super().__init__(side, side, color)

sq = Square(5, "red")
print(f"Square area: {sq.area()}, color: {sq.color}")`,
    "Create an inheritance hierarchy: Shape -> 2D Shapes (Rectangle, Circle) -> 3D Shapes (Cuboid, Sphere)."
  ),

  "magic-methods": lesson(
    `# Magic Methods in Python

Magic methods (dunder methods) allow custom behavior for built-in operations.

## String Representation

\`\`\`python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def __str__(self):
        return f"{self.name}, {age} years old"
    
    def __repr__(self):
        return f"Person('{self.name}', {self.age})"
\`\`\`

## Comparison Operators

\`\`\`python
class Number:
    def __init__(self, value):
        self.value = value
    
    def __eq__(self, other):
        return self.value == other.value
    
    def __lt__(self, other):
        return self.value < other.value
\`\`\`

## Arithmetic Operators

\`\`\`python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    
    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)
    
    def __mul__(self, scalar):
        return Vector(self.x * scalar, self.y * scalar)
\`\`\``,
    `# Magic methods example
class Fraction:
    def __init__(self, num, denom):
        self.num = num
        self.denom = denom
    
    def __str__(self):
        return f"{self.num}/{self.denom}"
    
    def __eq__(self, other):
        return self.num * other.denom == other.num * self.denom
    
    def __add__(self, other):
        new_num = self.num * other.denom + other.num * self.denom
        new_denom = self.denom * other.denom
        return Fraction(new_num, new_denom)

f1 = Fraction(1, 2)
f2 = Fraction(2, 4)
print(f1)
print(f1 == f2)
print(f1 + f2)`,
    "Create a class that supports arithmetic operations on complex numbers."
  ),

  "decorators": lesson(
    `# Decorators in Python

Decorators modify the behavior of functions or classes.

## Basic Decorator

\`\`\`python
def my_decorator(func):
    def wrapper():
        print("Before function")
        func()
        print("After function")
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")
\`\`\`

## Decorator with Arguments

\`\`\`python
def repeat(times):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"Hello, {name}!")
\`\`\`

## Preserving Function Metadata

\`\`\`python
import functools

def debug(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper
\`\`\``,
    `# Decorator example
import functools
import time

def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end-start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(0.5)
    return "Done"

print(slow_function())`,
    "Create a decorator that caches function results (memoization)."
  ),

  "file-io": lesson(
    `# File I/O in Python

Python provides easy ways to read from and write to files.

## Reading Files

\`\`\`python
# Read entire file
with open("file.txt", "r") as f:
    content = f.read()

# Read line by line
with open("file.txt", "r") as f:
    for line in f:
        print(line.strip())

# Read all lines into list
with open("file.txt", "r") as f:
    lines = f.readlines()
\`\`\`

## Writing Files

\`\`\`python
with open("output.txt", "w") as f:
    f.write("Hello, World!\n")
    f.write("Second line\n")

# Append to file
with open("output.txt", "a") as f:
    f.write("Appended line\n")
\`\`\`

## JSON Files

\`\`\`python
import json

data = {"name": "Alice", "age": 30}

# Write JSON
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

# Read JSON
with open("data.json", "r") as f:
    loaded = json.load(f)
\`\`\``,
    `# File I/O example
import json

# Write to file
with open("sample.txt", "w") as f:
    f.write("Hello from Python!\n")
    f.write("File handling is easy.\n")

# Read from file
with open("sample.txt", "r") as f:
    content = f.read()
    print(content)

# JSON handling
data = {"language": "Python", "version": 3.12}
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

with open("data.json", "r") as f:
    loaded = json.load(f)
print(f"Loaded: {loaded}")`,
    "Create a program that reads a CSV file and converts it to JSON format."
  ),

};

// =============================================================================
// JAVASCRIPT LESSONS
// =============================================================================

const JAVASCRIPT_LESSONS: Record<string, LessonContent> = {

  "variables-types": lesson(
    `# Variables & Types in JavaScript

JavaScript has three ways to declare variables with different scoping rules.

## Variable Declaration

\`\`\`javascript
// const - for constants (block-scoped)
const PI = 3.14159;

// let - for variables that change (block-scoped)
let count = 0;
count = count + 1;

// var - older way (function-scoped, avoid)
var name = "Alice";
\`\`\`

## JavaScript Data Types

### Primitives
\`\`\`javascript
// String
let greeting = "Hello";
let name = 'World';
let template = \`Hello, \${name}!\`;

// Number
let age = 25;
let price = 19.99;

// Boolean
let isActive = true;
let isComplete = false;

// Undefined
let uninitialized;

// Null
let empty = null;
\`\`\`

### Objects
\`\`\`javascript
let person = { name: "Alice", age: 30 };
let numbers = [1, 2, 3, 4, 5];
\`\`\`

## Type Checking

\`\`\`javascript
typeof 42          // "number"
typeof "hello"     // "string"
typeof true        // "boolean"
typeof undefined    // "undefined"
typeof null        // "object" (historical bug!)
typeof {}          // "object"
\`\`\``,
    `// Variable declaration
const name = "JavaScript";
let version = "ES2024";
let isAwesome = true;

console.log(\`\${name} version \${version} is awesome: \${isAwesome}\`);

// Template literal
const greeting = \`Welcome to \${name}!\`;
console.log(greeting);

// Type checking
console.log(typeof name, typeof version, typeof isAwesome);`,
    "Create variables of different types and write a function that describes each type."
  ),

  "functions": lesson(
    `# Functions in JavaScript

Functions are first-class citizens in JavaScript.

## Function Declarations

\`\`\`javascript
function greet(name) {
    return "Hello, " + name + "!";
}

function greet(name = "World") {
    return \`Hello, \${name}!\`;
}
\`\`\`

## Arrow Functions

\`\`\`javascript
const add = (a, b) => a + b;
const greet = (name) => {
    const message = \`Hello, \${name}!\`;
    return message;
};
\`\`\`

## Closures

\`\`\`javascript
function counter() {
    let count = 0;
    return function() {
        count++;
        return count;
    };
}

const increment = counter();
console.log(increment());  // 1
console.log(increment());  // 2
\`\`\`

## Rest Parameters

\`\`\`javascript
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}

console.log(sum(1, 2, 3, 4, 5));  // 15
\`\`\``,
    `// Arrow functions
const square = x => x * x;
const add = (a, b) => a + b;

// Closure example
const multiplier = factor => number => number * factor;
const double = multiplier(2);
const triple = multiplier(3);

console.log(double(5));  // 10
console.log(triple(5));   // 15

// Higher-order function
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log(doubled);`,
    "Create a function that uses closures to create a calculator with memory."
  ),

  "arrays": lesson(
    `# Arrays in JavaScript

Arrays are ordered collections that can hold any type of value.

## Creating Arrays

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5];
const mixed = [1, "hello", true, null, { key: "value" }];
\`\`\`

## Array Methods

### Adding/Removing
\`\`\`javascript
const arr = [1, 2, 3];
arr.push(4);      // Add to end
arr.pop();        // Remove from end
arr.unshift(0);   // Add to beginning
arr.shift();      // Remove from beginning
\`\`\`

### Transformation
\`\`\`javascript
const nums = [1, 2, 3, 4, 5];

nums.map(x => x * 2)           // [2, 4, 6, 8, 10]
nums.filter(x => x % 2 === 0) // [2, 4]
nums.reduce((a, b) => a + b, 0) // 15
nums.every(x => x > 0)       // true
nums.some(x => x > 4)         // true
\`\`\`

### Sorting
\`\`\`javascript
const arr = [3, 1, 4, 1, 5];
arr.sort((a, b) => a - b);  // Ascending
\`\`\``,
    `const numbers = [1, 2, 3, 4, 5];

// Map, filter, reduce
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((a, b) => a + b, 0);

console.log("Original:", numbers);
console.log("Doubled:", doubled);
console.log("Evens:", evens);
console.log("Sum:", sum);

// Destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log(first, second, rest);`,
    "Use array methods to process a list of students and calculate average scores."
  ),

  "objects": lesson(
    `# Objects in JavaScript

Objects are collections of key-value pairs.

## Creating Objects

\`\`\`javascript
const person = {
    name: "Alice",
    age: 30,
    greet: function() {
        return "Hello!";
    }
};

// Shorthand method
const person2 = {
    name: "Bob",
    greet() {
        return "Hi!";
    }
};
\`\`\`

## Accessing Properties

\`\`\`javascript
person.name      // "Alice"
person["name"]   // "Alice"
\`\`\`

## Object Methods

\`\`\`javascript
Object.keys(person)    // ["name", "age", "greet"]
Object.values(person)  // ["Alice", 30, function]
Object.entries(person) // [["name", "Alice"], ...]

// Spread operator
const copy = { ...person };
const merged = { ...obj1, ...obj2 };
\`\`\`

## Destructuring

\`\`\`javascript
const { name, age } = person;
const { name: personName } = person;
\`\`\``,
    `const car = {
    brand: "Toyota",
    model: "Camry",
    year: 2024,
    features: ["GPS", "Bluetooth"]
};

console.log(car.brand);
console.log(car["model"]);

// Destructuring
const { brand, model, ...rest } = car;
console.log(brand, model);
console.log(rest);

// Object methods
const keys = Object.keys(car);
const values = Object.values(car);
console.log("Keys:", keys);`,
    "Create an object-based inventory system with methods to add, remove, and search items."
  ),

  "async-await": lesson(
    `# Async/Await in JavaScript

Async/await provides cleaner syntax for working with Promises.

## Promise Basics

\`\`\`javascript
const myPromise = new Promise((resolve, reject) => {
    const success = true;
    if (success) resolve("Done!");
    else reject("Failed!");
});

myPromise
    .then(result => console.log(result))
    .catch(error => console.error(error));
\`\`\`

## Async Functions

\`\`\`javascript
async function fetchData() {
    return "Data fetched!";
}

async function getData() {
    const result = await fetchData();
    return result;
}
\`\`\`

## Error Handling

\`\`\`javascript
async function fetchUser(id) {
    try {
        const response = await fetch(\`/api/users/\${id}\`);
        const user = await response.json();
        return user;
    } catch (error) {
        console.error("Error:", error.message);
        return null;
    }
}
\`\`\`

## Parallel Execution

\`\`\`javascript
async function fetchAll() {
    const [user, posts] = await Promise.all([
        fetchUser(1),
        fetchPosts()
    ]);
    return { user, posts };
}
\`\`\``,
    `// Simulated async operations
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchUserData() {
    console.log("Fetching user...");
    await delay(1000);
    return { id: 1, name: "Alice" };
}

async function main() {
    console.log("Start");
    const user = await fetchUserData();
    console.log("User:", user);
    console.log("End");
}

main();`,
    "Create async functions that fetch data in parallel and handle errors gracefully."
  ),

  "dom-manipulation": lesson(
    `# DOM Manipulation in JavaScript

The DOM allows JavaScript to interact with HTML elements.

## Selecting Elements

\`\`\`javascript
const element = document.getElementById("myId");
const items = document.querySelectorAll(".item");
const el = document.querySelector(".class");
\`\`\`

## Modifying Elements

\`\`\`javascript
div.textContent = "New text";
div.innerHTML = "<p>HTML content</p>";
div.setAttribute("data-id", "123");
div.classList.add("active");
div.classList.remove("hidden");
div.classList.toggle("expanded");
\`\`\`

## Creating Elements

\`\`\`javascript
const newDiv = document.createElement("div");
newDiv.textContent = "I'm new!";
document.body.appendChild(newDiv);
\`\`\`

## Event Handling

\`\`\`javascript
button.addEventListener("click", (event) => {
    console.log("Clicked!", event.target);
});

element.addEventListener("mouseenter", () => {
    console.log("Mouse entered");
});
\`\`\``,
    `// DOM manipulation example
const container = document.querySelector("#container");

// Create a card
const card = document.createElement("div");
card.className = "card";
card.innerHTML = "<h3>New Card</h3><p>Content here</p>";

// Add click handler
card.addEventListener("click", () => {
    card.classList.toggle("active");
});

// Add to container
container.appendChild(card);

// Class manipulation
card.classList.add("highlighted");
card.classList.remove("card");
console.log(card.classList.contains("highlighted"));`,
    "Create a simple todo list with add, remove, and toggle functionality."
  ),

  "promises": lesson(
    `# Promises in JavaScript

Promises represent eventual completion (or failure) of async operations.

## Creating Promises

\`\`\`javascript
const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("Success!");
        // or: reject(new Error("Failed"));
    }, 1000);
});
\`\`\`

## Using Promises

\`\`\`javascript
promise
    .then(result => console.log(result))
    .catch(error => console.error(error))
    .finally(() => console.log("Complete"));
\`\`\`

## Promise Chaining

\`\`\`javascript
fetch("/api/user")
    .then(response => response.json())
    .then(user => fetch(\`/api/posts/\${user.id}\`))
    .then(response => response.json())
    .then(posts => console.log(posts))
    .catch(error => console.error(error));
\`\`\`

## Promise Combinators

\`\`\`javascript
// All must succeed
const [a, b] = await Promise.all([fetchA(), fetchB()]);

// First to settle
const result = await Promise.race([fast(), slow()]);

// All settle (even if some fail)
const results = await Promise.allSettled([fetchA(), fetchB()]);
\`\`\``,
    `// Promise example
function fetchData(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (id > 0) {
                resolve({ id, name: \`User \${id}\` });
            } else {
                reject(new Error("Invalid ID"));
            }
        }, 500);
    });
}

// Using promises
fetchData(1)
    .then(user => {
        console.log("Fetched:", user);
        return fetchData(2);
    })
    .then(user => console.log("Second:", user))
    .catch(err => console.error("Error:", err.message))
    .finally(() => console.log("Done!"));`,
    "Create a promise-based API wrapper that handles loading, success, and error states."
  ),

};

// =============================================================================
// C LESSONS
// =============================================================================

const C_LESSONS: Record<string, LessonContent> = {

  "first-c-program": lesson(
    `# Your First C Program

Let's write the classic "Hello, World!" program in C.

## Anatomy of a C Program

\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\`

## Breaking it Down

### #include <stdio.h>
- **Preprocessor directive**
- \`stdio.h\` = Standard Input/Output header
- Provides \`printf()\` function

### int main()
- **Entry point** - where execution begins
- \`int\` = returns an integer (exit code)

### printf("Hello, World!\\n");
- Prints text to console
- \`\\n\` = newline character
- Semicolon (;) ends every statement

## Compiling and Running

\`\`\`bash
gcc hello.c -o hello
./hello
\`\`

## Common Output

\`\`\`c
printf("String: %s\\n", "hello");
printf("Integer: %d\\n", 42);
printf("Float: %.2f\\n", 3.14159);
printf("Character: %c\\n", 'A');
\`\`\``,
    `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    printf("Learning C programming\\n");
    printf("Format: %s %d %.2f\\n", "Numbers:", 42, 3.14);
    return 0;
}`,
    "Write a C program that prints your name, age, and favorite programming language."
  ),

  "primitive-data-types": lesson(
    `# Primitive Data Types in C

C provides fundamental data types for storing different kinds of data.

## Integer Types

\`\`\`c
int age = 25;
printf("%d\\n", age);

short smallNum = 100;
long bigNum = 1000000L;
unsigned int positive = 100;
\`\`\`

## Floating-Point Types

\`\`\`c
float pi = 3.14f;
printf("%f\\n", pi);
printf("%.2f\\n", pi);

double e = 2.718281828;
long double root2 = 1.4142135623730950488L;
\`\`\`

## Character Type

\`\`\`c
char grade = 'A';
printf("%c\\n", grade);
printf("%d\\n", grade);  // ASCII value: 65
\`\`\`

## sizeof Operator

\`\`\`c
printf("int: %zu bytes\\n", sizeof(int));
printf("float: %zu bytes\\n", sizeof(float));
printf("char: %zu bytes\\n", sizeof(char));
\`\`\`

## Type Conversion

\`\`\`c
int i = 10;
float f = 3.14;

float result = i + f;
int x = (int)3.14;  // Explicit cast
\`\`\``,
    `#include <stdio.h>
#include <stdbool.h>

int main() {
    int integer = 42;
    float decimal = 3.14f;
    double bigDecimal = 2.71828;
    char letter = 'A';
    bool flag = true;
    
    printf("Integer: %d\\n", integer);
    printf("Float: %.2f\\n", decimal);
    printf("Double: %.5lf\\n", bigDecimal);
    printf("Char: %c (ASCII: %d)\\n", letter, letter);
    printf("Bool: %d\\n", flag);
    
    printf("\\nSizes:\\n");
    printf("int: %zu bytes\\n", sizeof(int));
    printf("float: %zu bytes\\n", sizeof(float));
    
    return 0;
}`,
    "Write a program that demonstrates all basic data types and their sizes."
  ),

  "conditional-statements": lesson(
    `# Conditional Statements in C

Control program flow with if-else and switch statements.

## if Statement

\`\`\`c
int age = 18;

if (age >= 18) {
    printf("You are an adult\\n");
}
\`\`\`

## if-else Statement

\`\`\`c
int number = 10;

if (number % 2 == 0) {
    printf("Even\\n");
} else {
    printf("Odd\\n");
}
\`\`\`

## if-else-if Chain

\`\`\`c
int score = 85;
char grade;

if (score >= 90) grade = 'A';
else if (score >= 80) grade = 'B';
else if (score >= 70) grade = 'C';
else grade = 'F';

printf("Grade: %c\\n", grade);
\`\`\`

## switch Statement

\`\`\`c
int day = 3;
switch (day) {
    case 1: printf("Monday\\n"); break;
    case 2: printf("Tuesday\\n"); break;
    case 3: printf("Wednesday\\n"); break;
    default: printf("Unknown\\n");
}
\`\`\``,
    `#include <stdio.h>

int main() {
    int num = 15;
    
    if (num > 0) {
        printf("%d is positive\\n", num);
    } else if (num < 0) {
        printf("%d is negative\\n", num);
    } else {
        printf("%d is zero\\n", num);
    }
    
    if (num % 5 == 0) {
        printf("%d is divisible by 5\\n", num);
    }
    
    return 0;
}`,
    "Write a calculator program using switch case to perform basic arithmetic."
  ),

  "loops": lesson(
    `# Loops in C

Execute code repeatedly with for, while, and do-while loops.

## for Loop

\`\`\`c
for (int i = 0; i < 5; i++) {
    printf("%d ", i);  // 0 1 2 3 4
}

for (int i = 0; i < 10; i += 2) {
    printf("%d ", i);  // 0 2 4 6 8
}
\`\`\`

## while Loop

\`\`\`c
int count = 0;
while (count < 5) {
    printf("%d ", count);
    count++;
}
\`\`\`

## do-while Loop

\`\`\`c
int num;
do {
    printf("Enter positive: ");
    scanf("%d", &num);
} while (num <= 0);
\`\`\`

## Loop Control

\`\`\`c
for (int i = 0; i < 10; i++) {
    if (i == 5) break;      // Exit loop
    printf("%d ", i);
}

for (int i = 0; i < 5; i++) {
    if (i == 2) continue;   // Skip iteration
    printf("%d ", i);
}
\`\`\``,
    `#include <stdio.h>

int main() {
    // Sum of first n numbers
    int n = 10;
    int sum = 0;
    
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    printf("Sum of 1 to %d: %d\\n", n, sum);
    
    // While loop countdown
    int count = 5;
    while (count > 0) {
        printf("%d... ", count);
        count--;
    }
    printf("Blastoff!\\n");
    
    return 0;
}`,
    "Write a program that finds all prime numbers up to a given limit."
  ),

  "pointers": lesson(
    `# Pointers in C

Pointers store memory addresses, enabling direct memory access.

## Declaring Pointers

\`\`\`c
int num = 42;
int *ptr = &num;  // ptr stores address of num

printf("Value: %d\\n", num);
printf("Address: %p\\n", (void*)&num);
printf("Via pointer: %d\\n", *ptr);
\`\`\`

## Pointer Arithmetic

\`\`\`c
int arr[] = {10, 20, 30, 40, 50};
int *p = arr;

printf("%d\\n", *p);       // 10 (first element)
printf("%d\\n", *(p+1));   // 20 (second element)
printf("%d\\n", *(p+2));   // 30 (third element)
\`\`\`

## Pointers and Functions

\`\`\`c
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int x = 5, y = 10;
swap(&x, &y);
printf("%d %d", x, y);  // 10 5
\`\`\`

## Dynamic Memory

\`\`\`c
#include <stdlib.h>

int *arr = malloc(5 * sizeof(int));
if (arr == NULL) return 1;

for (int i = 0; i < 5; i++) {
    arr[i] = i * 10;
}

free(arr);
\`\`\``,
    `#include <stdio.h>
#include <stdlib.h>

int main() {
    int num = 42;
    int *ptr = &num;
    
    printf("num value: %d\\n", num);
    printf("num address: %p\\n", (void*)&num);
    printf("ptr value (address): %p\\n", (void*)ptr);
    printf("ptr dereferenced: %d\\n", *ptr);
    
    // Pointer arithmetic
    int arr[] = {10, 20, 30};
    int *p = arr;
    printf("*(p+1): %d\\n", *(p+1));
    
    return 0;
}`,
    "Create a function that uses pointers to find the maximum element in an array."
  ),

  "functions": lesson(
    `# Functions in C

Functions are reusable blocks of code.

## Function Declaration

\`\`\`c
int add(int a, int b) {
    return a + b;
}

void greet(char *name) {
    printf("Hello, %s!\\n", name);
}
\`\`\`

## Recursion

\`\`\`c
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

## Passing Arrays to Functions

\`\`\`c
int sumArray(int arr[], int size) {
    int sum = 0;
    for (int i = 0; i < size; i++) {
        sum += arr[i];
    }
    return sum;
}
\`\`\`

## Pass by Reference

\`\`\`c
void modify(int *ptr) {
    *ptr = 100;
}

int num = 50;
modify(&num);
printf("%d\\n", num);  // 100
\`\`\``,
    `#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int power(int base, int exp) {
    int result = 1;
    for (int i = 0; i < exp; i++) {
        result *= base;
    }
    return result;
}

int main() {
    printf("5! = %d\\n", factorial(5));
    printf("2^10 = %d\\n", power(2, 10));
    return 0;
}`,
    "Write a function to check if a string is a palindrome using pointers."
  ),

};

// =============================================================================
// JAVA LESSONS
// =============================================================================

const JAVA_LESSONS: Record<string, LessonContent> = {

  "setup-first-program": lesson(
    `# Setting Up Java & Your First Program

Java is an object-oriented language known for "Write Once, Run Anywhere."

## Installing Java

\`\`\`bash
java -version
javac -version
\`\`\`

## Your First Java Program

\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

## Key Concepts

- Every program must have at least one class
- Class name should match filename
- \`public static void main(String[] args)\` is the entry point
- \`System.out.println()\` prints to console

## Compiling & Running

\`\`\`bash
javac HelloWorld.java
java HelloWorld
\`\`\`

## Input in Java

\`\`\`java
import java.util.Scanner;

Scanner scanner = new Scanner(System.in);
String name = scanner.nextLine();
scanner.close();
\`\`\``,
    `public class HelloWorld {
    public static void main(String[] args) {
        String name = "Java";
        int version = 21;
        
        System.out.println("Welcome to " + name + "!");
        System.out.printf("Using Java version %d%n", version);
        System.out.println("Learning Java is fun!");
    }
}`,
    "Create a Java program that takes user input and prints a formatted greeting."
  ),

  "conditionals": lesson(
    `# Conditionals in Java

Control program flow with if-else and switch statements.

## if Statement

\`\`\`java
int age = 18;
if (age >= 18) {
    System.out.println("Adult");
}
\`\`\`

## if-else Statement

\`\`\`java
int number = 10;
if (number % 2 == 0) {
    System.out.println("Even");
} else {
    System.out.println("Odd");
}
\`\`\`

## if-else-if Chain

\`\`\`java
int score = 85;
char grade;
if (score >= 90) grade = 'A';
else if (score >= 80) grade = 'B';
else if (score >= 70) grade = 'C';
else grade = 'F';
\`\`\`

## switch Statement

\`\`\`java
int day = 3;
String dayName = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 3 -> "Wednesday";
    default -> "Unknown";
};
\`\`\``,
    `public class ConditionalDemo {
    public static void main(String[] args) {
        int number = 15;
        
        if (number > 0) {
            System.out.println("Positive");
        } else if (number < 0) {
            System.out.println("Negative");
        } else {
            System.out.println("Zero");
        }
        
        // Using switch
        int choice = 2;
        switch (choice) {
            case 1: System.out.println("One"); break;
            case 2: System.out.println("Two"); break;
            default: System.out.println("Other");
        }
    }
}`,
    "Write a Java program that converts a number grade to letter grade."
  ),

  "loops": lesson(
    `# Loops in Java

Execute code repeatedly with for, while, and do-while loops.

## for Loop

\`\`\`java
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}

// Enhanced for loop
int[] numbers = {1, 2, 3, 4, 5};
for (int num : numbers) {
    System.out.println(num);
}
\`\`\`

## while Loop

\`\`\`java
int count = 0;
while (count < 5) {
    System.out.println(count);
    count++;
}
\`\`\`

## do-while Loop

\`\`\`java
Scanner scanner = new Scanner(System.in);
int number;
do {
    System.out.print("Enter positive: ");
    number = scanner.nextInt();
} while (number <= 0);
\`\`\`

## Loop Control

\`\`\`java
for (int i = 0; i < 10; i++) {
    if (i == 5) break;
    System.out.print(i + " ");
}

for (int i = 0; i < 5; i++) {
    if (i == 2) continue;
    System.out.print(i + " ");
}
\`\`\``,
    `public class LoopDemo {
    public static void main(String[] args) {
        // Sum using for loop
        int sum = 0;
        for (int i = 1; i <= 10; i++) {
            sum += i;
        }
        System.out.println("Sum 1-10: " + sum);
        
        // Factorial using while
        int num = 5;
        long factorial = 1;
        while (num > 0) {
            factorial *= num;
            num--;
        }
        System.out.println("5! = " + factorial);
    }
}`,
    "Create a Java program that prints a pattern using nested loops."
  ),

  "classes-objects": lesson(
    `# Classes & Objects in Java

Classes are blueprints; objects are instances of classes.

## Defining a Class

\`\`\`java
public class Person {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public String getName() {
        return name;
    }
    
    public void setAge(int age) {
        if (age >= 0) this.age = age;
    }
    
    public void introduce() {
        System.out.println("Hi, I'm " + name);
    }
}
\`\`\`

## Creating Objects

\`\`\`java
Person alice = new Person("Alice", 30);
alice.introduce();
\`\`\``,
    `public class Rectangle {
    private double width;
    private double height;
    
    public Rectangle(double w, double h) {
        this.width = w;
        this.height = h;
    }
    
    public double getArea() {
        return width * height;
    }
    
    public double getPerimeter() {
        return 2 * (width + height);
    }
    
    public static void main(String[] args) {
        Rectangle rect = new Rectangle(5.0, 3.0);
        System.out.println("Area: " + rect.getArea());
        System.out.println("Perimeter: " + rect.getPerimeter());
    }
}`,
    "Create a BankAccount class with deposit, withdraw, and balance methods."
  ),

  "inheritance": lesson(
    `# Inheritance in Java

Inheritance allows a class to inherit properties from another class.

## Basic Inheritance

\`\`\`java
public class Animal {
    protected String name;
    
    public Animal(String name) {
        this.name = name;
    }
    
    public void eat() {
        System.out.println(name + " is eating");
    }
}

public class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }
    
    public void bark() {
        System.out.println(name + " says Woof!");
    }
}
\`\`\`

## Method Overriding

\`\`\`java
@Override
public void eat() {
    System.out.println(name + " is eating dog food");
}
\`\`\`

## super Keyword

\`\`\`java
public class Child extends Parent {
    public Child() {
        super();  // Call parent constructor
    }
}
\`\`\``,
    `// Shape hierarchy
abstract class Shape {
    abstract double getArea();
}

class Circle extends Shape {
    double radius;
    Circle(double r) { radius = r; }
    
    double getArea() { return Math.PI * radius * radius; }
}

class Rectangle extends Shape {
    double width, height;
    Rectangle(double w, double h) { width = w; height = h; }
    
    double getArea() { return width * height; }
}

public class Main {
    public static void main(String[] args) {
        Shape[] shapes = { new Circle(5), new Rectangle(4, 6) };
        for (Shape s : shapes) {
            System.out.printf("%.2f%n", s.getArea());
        }
    }
}`,
    "Create an inheritance hierarchy for vehicles (Vehicle -> Car, Motorcycle)."
  ),

  "interfaces": lesson(
    `# Interfaces in Java

Interfaces define contracts that classes must implement.

## Defining an Interface

\`\`\`java
public interface Drawable {
    void draw();
    default void print() {
        System.out.println("Printing...");
    }
}
\`\`\`

## Implementing an Interface

\`\`\`java
public class Circle implements Drawable {
    @Override
    public void draw() {
        System.out.println("Drawing circle");
    }
}
\`\`\`

## Multiple Interfaces

\`\`\`java
public class Button implements Clickable, Focusable {
    // Must implement all methods
}
\`\`\`

## Functional Interfaces (Java 8+)

\`\`\`java
@FunctionalInterface
public interface Calculator {
    int calculate(int a, int b);
}

Calculator add = (a, b) -> a + b;
\`\`\``,
    `interface Printable {
    void print();
}

interface Serializable {
    void serialize();
}

class Document implements Printable, Serializable {
    private String content;
    
    Document(String content) { this.content = content; }
    
    public void print() {
        System.out.println("Printing: " + content);
    }
    
    public void serialize() {
        System.out.println("Serializing: " + content);
    }
}

public class Main {
    public static void main(String[] args) {
        Document doc = new Document("Hello World");
        doc.print();
        doc.serialize();
    }
}`,
    "Create an interface for a payment system with different payment methods."
  ),

};

// =============================================================================
// C++ LESSONS
// =============================================================================

const CPP_LESSONS: Record<string, LessonContent> = {

  "first-cpp-program": lesson(
    `# Your First C++ Program

C++ combines C's low-level control with object-oriented features.

## Hello World in C++

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
\`\`\`

## Breaking it Down

### #include <iostream>
- Header file for I/O operations
- Provides \`cin\` and \`cout\`

### using namespace std;
- Allows using std:: members without prefix

### cout <<
- \`cout\` = console output stream
- \`<<\` = insertion operator

## Compiling & Running

\`\`\`bash
g++ hello.cpp -o hello
./hello
\`\`\`

## Basic I/O

\`\`\`cpp
string name;
int age;
cin >> name >> age;
cout << "Hello, " << name << endl;
\`\`\``,
    `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name = "C++";
    int version = 20;
    
    cout << "Welcome to " << name << "!" << endl;
    cout << "Version: " << version << endl;
    cout << "Learning C++ is powerful!" << endl;
    
    return 0;
}`,
    "Write a C++ program that takes user input and displays formatted output."
  ),

  "references": lesson(
    `# References in C++

References are aliases for existing variables.

## Declaring References

\`\`\`cpp
int x = 10;
int& ref = x;  // ref is reference to x

ref = 20;      // Changes x to 20
cout << x;     // 20
\`\`\`

## Reference vs Pointer

\`\`\`cpp
int x = 10;

// Reference
int& ref = x;
ref = 20;

// Pointer
int* ptr = &x;
*ptr = 20;
\`\`\`

## References in Functions

\`\`\`cpp
void swap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

void printName(const string& name) {
    cout << name << endl;
}
\`\`\``,
    `#include <iostream>
using namespace std;

void modify(int& ref) {
    ref *= 2;
}

int main() {
    int num = 10;
    cout << "Before: " << num << endl;
    modify(num);
    cout << "After: " << num << endl;
    return 0;
}`,
    "Create a function that uses references to find min and max of two numbers."
  ),

  "classes": lesson(
    `# Classes in C++

Classes bundle data and functions into single units.

## Defining a Class

\`\`\`cpp
class Rectangle {
private:
    double width;
    double height;
    
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    
    double area() const {
        return width * height;
    }
};
\`\`\`

## Using the Class

\`\`\`cpp
int main() {
    Rectangle rect(5.0, 3.0);
    cout << "Area: " << rect.area() << endl;
}
\`\`\`

## Constructors

\`\`\`cpp
class Point {
private:
    int x, y;
public:
    Point() : x(0), y(0) {}
    Point(int x, int y) : x(x), y(y) {}
    Point(const Point& p) : x(p.x), y(p.y) {}
};
\`\`\``,
    `class BankAccount {
private:
    string owner;
    double balance;
    
public:
    BankAccount(string name, double initial) : owner(name), balance(initial) {}
    
    void deposit(double amount) {
        if (amount > 0) balance += amount;
    }
    
    void withdraw(double amount) {
        if (amount > 0 && amount <= balance) balance -= amount;
    }
    
    double getBalance() const { return balance; }
};

int main() {
    BankAccount acc("Alice", 1000);
    acc.deposit(500);
    acc.withdraw(200);
    cout << "Balance: " << acc.getBalance() << endl;
}`,
    "Create a class for a student with name, ID, and GPA."
  ),

  "stl-containers": lesson(
    `# STL Containers in C++

The Standard Template Library provides efficient container classes.

## Vector (Dynamic Array)

\`\`\`cpp
#include <vector>

vector<int> nums = {1, 2, 3, 4, 5};
nums.push_back(6);
nums.pop_back();
nums.insert(nums.begin() + 2, 10);
\`\`\`

## Map (Key-Value Pairs)

\`\`\`cpp
#include <map>

map<string, int> ages;
ages["Alice"] = 30;
ages["Bob"] = 25;

for (auto& [name, age] : ages) {
    cout << name << ": " << age << endl;
}
\`\`\`

## Set (Unique Elements)

\`\`\`cpp
#include <set>

set<int> s = {5, 2, 8, 2, 1};
// s = {1, 2, 5, 8}
s.insert(3);
\`\`\`

## Stack, Queue

\`\`\`cpp
#include <stack>
#include <queue>

stack<int> st;
st.push(1); st.push(2);
cout << st.top() << endl;
\`\`\``,
    `#include <iostream>
#include <vector>
#include <map>
#include <algorithm>
using namespace std;

int main() {
    vector<int> nums = {5, 2, 8, 1, 9};
    sort(nums.begin(), nums.end());
    
    for (int n : nums) cout << n << " ";
    cout << endl;
    
    map<string, int> scores;
    scores["Alice"] = 95;
    scores["Bob"] = 87;
    
    for (auto& p : scores) {
        cout << p.first << ": " << p.second << endl;
    }
}`,
    "Use STL containers to count word frequencies in a sentence."
  ),

  "smart-pointers": lesson(
    `# Smart Pointers in C++

Smart pointers automatically manage memory.

## Types of Smart Pointers

\`\`\`cpp
#include <memory>

// unique_ptr - exclusive ownership
unique_ptr<int> p1(new int(10));
auto p2 = make_unique<int>(20);

// shared_ptr - shared ownership
shared_ptr<int> s1 = make_shared<int>(30);
shared_ptr<int> s2 = s1;
\`\`\`

## unique_ptr

\`\`\`cpp
{
    unique_ptr<int> p = make_unique<int>(42);
    cout << *p << endl;
}  // Automatically deleted

unique_ptr<int> p1 = make_unique<int>(10);
unique_ptr<int> p2 = move(p1);  // Transfer ownership
\`\`\`

## shared_ptr

\`\`\`cpp
{
    shared_ptr<int> s1 = make_shared<int>(100);
    {
        shared_ptr<int> s2 = s1;
        cout << s1.use_count() << endl;  // 2
    }
    cout << s1.use_count() << endl;  // 1
}
\`\`\``,
    `#include <iostream>
#include <memory>
using namespace std;

class Widget {
public:
    Widget() { cout << "Widget created\\n"; }
    ~Widget() { cout << "Widget destroyed\\n"; }
};

int main() {
    cout << "Using unique_ptr:\\n";
    {
        auto w = make_unique<Widget>();
    }
    
    cout << "\\nUsing shared_ptr:\\n";
    {
        auto s1 = make_shared<Widget>();
        auto s2 = s1;
        cout << "Ref count: " << s1.use_count() << endl;
    }
    
    return 0;
}`,
    "Use smart pointers to manage a dynamically allocated array."
  ),

};

// =============================================================================
// TYPESCRIPT LESSONS
// =============================================================================

const TYPESCRIPT_LESSONS: Record<string, LessonContent> = {

  "basic-types": lesson(
    `# Basic Types in TypeScript

TypeScript adds static types to JavaScript.

## Type Annotations

\`\`\`typescript
let name: string = "Alice";
let age: number = 30;
let isActive: boolean = true;

let numbers: number[] = [1, 2, 3];
let tuple: [string, number] = ["hello", 42];
\`\`\`

## Type Inference

\`\`\`typescript
let x = 10;        // number
let y = "hello";   // string
const z = { a: 1 }; // { a: number }
\`\`\`

## Enum

\`\`\`typescript
enum Color {
    Red = "red",
    Green = "green",
    Blue = "blue"
}

let c: Color = Color.Green;
\`\`\`

## Union Types

\`\`\`typescript
let id: string | number;
id = "abc123";
id = 12345;

function formatId(id: string | number): string {
    return \`ID: \${id}\`;
}
\`\`\``,
    `// Type annotations
let count: number = 5;
let message: string = "Hello";
let isDone: boolean = false;

// Array
let scores: number[] = [90, 85, 92];

// Tuple
let person: [string, number] = ["Alice", 30];

// Union
type Status = "pending" | "approved" | "rejected";
let status: Status = "pending";

console.log(count, message, isDone);`,
    "Create a TypeScript program that uses different types and type aliases."
  ),

  "interfaces": lesson(
    `# Interfaces in TypeScript

Interfaces define the shape of objects.

## Basic Interface

\`\`\`typescript
interface User {
    name: string;
    age: number;
    email?: string;  // Optional
    readonly id: number;  // Cannot be modified
}

const user: User = {
    name: "Alice",
    age: 30,
    id: 1
};
\`\`\`

## Extending Interfaces

\`\`\`typescript
interface Animal {
    name: string;
}

interface Dog extends Animal {
    breed: string;
}

const dog: Dog = {
    name: "Buddy",
    breed: "Golden Retriever"
};
\`\`\`

## Function Types

\`\`\`typescript
interface MathFunc {
    (a: number, b: number): number;
}

const add: MathFunc = (x, y) => x + y;
\`\`\``,
    `interface Person {
    name: string;
    age: number;
    greet(): string;
}

const person: Person = {
    name: "Alice",
    age: 30,
    greet() {
        return \`Hello, I'm \${this.name}\`;
    }
};

console.log(person.greet());`,
    "Create interfaces for a library system with books and authors."
  ),

  "generics": lesson(
    `# Generics in TypeScript

Generics create reusable components that work with multiple types.

## Generic Functions

\`\`\`typescript
function identity<T>(arg: T): T {
    return arg;
}

const num = identity<number>(42);
const str = identity("hello");
\`\`\`

## Generic Interfaces

\`\`\`typescript
interface Container<T> {
    value: T;
    getValue(): T;
}

const stringContainer: Container<string> = {
    value: "Hello",
    getValue() { return this.value; }
};
\`\`\`

## Generic Constraints

\`\`\`typescript
interface HasLength {
    length: number;
}

function logLength<T extends HasLength>(arg: T): number {
    return arg.length;
}

logLength("hello");    // 5
logLength([1, 2, 3]);  // 3
\`\`\``,
    `// Generic functions
function firstElement<T>(arr: T[]): T | undefined {
    return arr[0];
}

console.log(firstElement([1, 2, 3]));
console.log(firstElement(["a", "b", "c"]));

// Generic interface
interface Pair<K, V> {
    key: K;
    value: V;
}

const pair: Pair<string, number> = { key: "age", value: 30 };
console.log(pair);`,
    "Create a generic Stack class with push and pop operations."
  ),

};

// =============================================================================
// C# LESSONS
// =============================================================================

const CSHARP_LESSONS: Record<string, LessonContent> = {

  "csharp-net-ecosystem": lesson(
    `# .NET Ecosystem

The .NET ecosystem is a comprehensive platform for building applications. Understanding its components is key to C# development.

## Core Components

### CLR (Common Language Runtime)
- The engine that executes .NET code
- Provides memory management, exception handling, security
- Compiles CIL (Common Intermediate Language) to native code

### FCL (Framework Class Library)
- Thousands of pre-built classes and APIs
- Organized in namespaces (System, Collections, IO, etc.)

### CLI (Common Language Infrastructure)
- Standard that .NET implementations follow
- Enables language interoperability

## .NET Versions
- .NET Framework (Windows-only, legacy)
- .NET Core (cross-platform, modern)
- .NET 5+ (unified platform)
- .NET 8 (current LTS)

## Your First C# Program

\`\`\`csharp
using System;

namespace HelloWorld
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello, World!");
        }
    }
}
\`\`\`

## Key Concepts
- **Namespace**: Organizes code logically
- **class**: Blueprint for objects
- **Main**: Entry point (static method)
- **Console.WriteLine**: Outputs text`,
    `// Complete program structure
using System;

class Program
{
    static void Main()
    {
        // Print your name
        Console.WriteLine("Welcome to C#!");
    }
}`,
    "Create a program that prints 'My first C# program' and includes comments explaining each part."
  ),

  "csharp-data-types-variables": lesson(
    `# Data Types & Variables in C#

C# is a strongly-typed language with rich type support.

## Value Types

### Integers
\`\`\`csharp
byte b = 255;      // 8-bit unsigned (0-255)
sbyte sb = -128;   // 8-bit signed (-128 to 127)
short s = 32000;   // 16-bit
int i = 2_000_000_000; // 32-bit (common)
long l = 9_000_000_000L; // 64-bit
\`\`\`

### Floating Point
\`\`\`csharp
float f = 3.14f;       // 32-bit, suffix 'f' required
double d = 3.14159;    // 64-bit (default)
decimal m = 3.14159m;  // High precision, suffix 'm'
\`\`\`

### Other Value Types
\`\`\`csharp
bool flag = true;      // true or false
char letter = 'A';    // 16-bit Unicode
DateTime dt = DateTime.Now;
\`\`\`

## Reference Types
\`\`\`csharp
string name = "Alice";     // Immutable string
object obj = new object(); // Base type
int[] numbers = {1, 2, 3}; // Arrays
\`\`\`

## var Keyword
\`\`\`csharp
var message = "Hello";     // Compiler infers string
var count = 42;           // Compiler infers int
\`\`\`

## Nullable Types
\`\`\`csharp
int? optional = null;      // Nullable value type
string? nullable = null;  // Nullable reference (C# 8+)
\`\`\`

## String Interpolation
\`\`\`csharp
string name = "Alice";
int age = 30;
Console.WriteLine($"Name: {name}, Age: {age}");
\`\`\``,
    `// Practice with different types
using System;

class Program
{
    static void Main()
    {
        // Declare variables of different types
        string name = "Bob";
        int age = 25;
        double height = 1.75;
        bool isStudent = true;
        
        // Print using string interpolation
        Console.WriteLine($"Name: {name}");
        Console.WriteLine($"Age: {age}");
        Console.WriteLine($"Height: {height}m");
        Console.WriteLine($"Student: {isStudent}");
    }
}`,
    "Create a program that declares variables for a product (name, price, quantity, inStock) and prints a formatted product description."
  ),

  "csharp-control-flow": lesson(
    `# Control Flow in C#

Master conditional statements and loops in C#.

## if-else Statements
\`\`\`csharp
int score = 85;

if (score >= 90)
{
    Console.WriteLine("A grade");
}
else if (score >= 80)
{
    Console.WriteLine("B grade");
}
else
{
    Console.WriteLine("C or below");
}
\`\`\`

## Switch Expressions (C# 8+)
\`\`\`csharp
string day = "Monday";
string activity = day switch
{
    "Monday" => "Gym",
    "Friday" => "Party",
    "Saturday" or "Sunday" => "Relax",
    _ => "Work"
};
\`\`\`

## Traditional Switch
\`\`\`csharp
switch (day)
{
    case "Monday":
    case "Tuesday":
        Console.WriteLine("Start of work week");
        break;
    case "Friday":
        Console.WriteLine("TGIF!");
        break;
    default:
        Console.WriteLine("Regular day");
        break;
}
\`\`\`

## Loops

### for Loop
\`\`\`csharp
for (int i = 0; i < 5; i++)
{
    Console.WriteLine(i);
}
\`\`\`

### foreach Loop
\`\`\`csharp
string[] fruits = {"apple", "banana", "cherry"};
foreach (string fruit in fruits)
{
    Console.WriteLine(fruit);
}
\`\`\`

### while Loop
\`\`\`csharp
int count = 0;
while (count < 5)
{
    Console.WriteLine(count++);
}
\`\`\`

### do-while Loop
\`\`\`csharp
int n = 0;
do
{
    Console.WriteLine(n++);
} while (n < 5);
\`\`\`

## Pattern Matching (C# 9+)
\`\`\`csharp
object obj = 42;
if (obj is int number)
{
    Console.WriteLine($"It's an int: {number}");
}
\`\`\``,
    `// FizzBuzz with control flow
using System;

class Program
{
    static void Main()
    {
        for (int i = 1; i <= 20; i++)
        {
            if (i % 15 == 0)
                Console.WriteLine("FizzBuzz");
            else if (i % 3 == 0)
                Console.WriteLine("Fizz");
            else if (i % 5 == 0)
                Console.WriteLine("Buzz");
            else
                Console.WriteLine(i);
        }
    }
}`,
    "Write a program that prints numbers 1-100, but replaces multiples of 3 with 'Foo', multiples of 5 with 'Bar', and multiples of both with 'FooBar'."
  ),

  "csharp-methods": lesson(
    `# Methods in C#

Methods are reusable blocks of code that perform specific tasks.

## Method Declaration
\`\`\`csharp
访问修饰符 返回类型 方法名(参数)
{
    // method body
    return value; // if not void
}

public int Add(int a, int b)
{
    return a + b;
}
\`\`\`

## Parameter Types

### ref Parameters
\`\`\`csharp
void Swap(ref int x, ref int y)
{
    int temp = x;
    x = y;
    y = temp;
}

// Usage
int a = 1, b = 2;
Swap(ref a, ref b);
\`\`\`

### out Parameters
\`\`\`csharp
bool TryParse(string s, out int result)
{
    try
    {
        result = int.Parse(s);
        return true;
    }
    catch
    {
        result = 0;
        return false;
    }
}

// Usage
if (TryParse("42", out int number))
{
    Console.WriteLine($"Parsed: {number}");
}
\`\`\`

### Optional Parameters
\`\`\`csharp
void Greet(string name = "Guest", string greeting = "Hello")
{
    Console.WriteLine($"{greeting}, {name}!");
}

Greet();                    // Hello, Guest!
Greet("Alice");             // Hello, Alice!
Greet("Bob", "Hi");         // Hi, Bob!
\`\`\`

### Params Array
\`\`\`csharp
int Sum(params int[] numbers)
{
    return numbers.Sum();
}

Console.WriteLine(Sum(1, 2, 3, 4, 5)); // 15
\`\`\`

## Expression-bodied Methods (C# 7+)
\`\`\`csharp
int Multiply(int a, int b) => a * b;
bool IsEven(int n) => n % 2 == 0;
\`\`\`

## Local Functions (C# 7+)
\`\`\`csharp
int Calculate(int n)
{
    int Square(int x) => x * x;
    return Square(n) + Square(n + 1);
}
\`\`\``,
    `// Method practice
using System;

class Calculator
{
    public int Add(int a, int b) => a + b;
    public int Subtract(int a, int b) => a - b;
    public int Multiply(int a, int b) => a * b;
    
    public double Divide(int a, int b)
    {
        if (b == 0)
        {
            Console.WriteLine("Cannot divide by zero!");
            return 0;
        }
        return (double)a / b;
    }
}

class Program
{
    static void Main()
    {
        var calc = new Calculator();
        Console.WriteLine($"5 + 3 = {calc.Add(5, 3)}");
        Console.WriteLine($"5 - 3 = {calc.Subtract(5, 3)}");
        Console.WriteLine($"5 * 3 = {calc.Multiply(5, 3)}");
        Console.WriteLine($"5 / 3 = {calc.Divide(5, 3):F2}");
        calc.Divide(5, 0);
    }
}`,
    "Create a Rectangle class with methods to calculate area, perimeter, and check if it's a square."
  ),

  "csharp-classes-records": lesson(
    `# Classes & Records in C#

Classes are the foundation of OOP in C#. Records (C# 9+) provide a modern alternative for data-centric types.

## Class Basics
\`\`\`csharp
public class Person
{
    // Fields (usually private)
    private string name;
    private int age;
    
    // Properties
    public string Name
    {
        get { return name; }
        set { name = value; }
    }
    
    public int Age
    {
        get => age;
        set => age = value >= 0 ? value : 0;
    }
    
    // Auto-property (shorthand)
    public string Email { get; set; }
    
    // Constructor
    public Person(string name, int age)
    {
        this.name = name;
        this.age = age;
    }
    
    // Methods
    public void Introduce()
    {
        Console.WriteLine($"Hi, I'm {name} and I'm {age}");
    }
}
\`\`\`

## Auto-Implemented Properties
\`\`\`csharp
public class Product
{
    public string Name { get; set; }
    public decimal Price { get; private set; }  // Read-only outside
    public int Quantity { get; init; }         // Set only at initialization
    
    public Product(string name, decimal price)
    {
        Name = name;
        Price = price;
        Quantity = 1;
    }
}
\`\`\`

## Records (C# 9+)
\`\`\`csharp
// Positional record
public record Person(string Name, int Age);

// With records, you get:
// - Immutable properties
// - Value-based equality
// - Built-in ToString()

var p1 = new Person("Alice", 30);
var p2 = new Person("Alice", 30);

Console.WriteLine(p1 == p2);  // True (value equality!)
\`\`\`

## Record with Methods
\`\`\`csharp
public record Person(string Name, int Age)
{
    public bool IsAdult => Age >= 18;
    
    public Person WithName(string newName) => 
        this with { Name = newName };
}
\`\`\``,
    `// Bank Account class
using System;

public class BankAccount
{
    private decimal balance;
    public string AccountNumber { get; }
    public string HolderName { get; set; }
    
    public decimal Balance => balance;
    
    public BankAccount(string accountNumber, string holderName, decimal initialBalance = 0)
    {
        AccountNumber = accountNumber;
        HolderName = holderName;
        balance = initialBalance >= 0 ? initialBalance : 0;
    }
    
    public void Deposit(decimal amount)
    {
        if (amount > 0)
        {
            balance += amount;
            Console.WriteLine(\$"Deposited {amount}. New balance: {balance}");
        }
    }
    
    public bool Withdraw(decimal amount)
    {
        if (amount > 0 && amount <= balance)
        {
            balance -= amount;
            Console.WriteLine(\$"Withdrew {amount}. New balance: {balance}");
            return true;
        }
        Console.WriteLine("Withdrawal failed!");
        return false;
    }
}

class Program
{
    static void Main()
    {
        var account = new BankAccount("12345", "Alice", 1000);
        Console.WriteLine(\$"Balance: {account.Balance}");
        account.Deposit(500);
        account.Withdraw(200);
        account.Withdraw(2000);
    }
}`,
    "Create a Student record with Name, Grade, and GPA properties, plus methods to AddCredits and UpdateGPA."
  ),

  "csharp-linq-queries": lesson(
    `# LINQ Queries in C#

Language Integrated Query (LINQ) provides powerful data querying capabilities.

## Query Syntax
\`\`\`csharp
from variable in collection
where condition
orderby expression
select projection
\`\`\`

## Basic Queries
\`\`\`csharp
int[] numbers = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// Query syntax
var evens = from n in numbers
            where n % 2 == 0
            select n;

// Method syntax
var odds = numbers.Where(n => n % 2 == 1);

// Both produce IEnumerable<int>
\`\`\`

## Projection
\`\`\`csharp
class Person { public string Name; public int Age; }

var people = new[] {
    new Person { Name = "Alice", Age = 30 },
    new Person { Name = "Bob", Age = 25 }
};

// Select single property
var names = people.Select(p => p.Name);

// Anonymous type projection
var projected = people.Select(p => new {
    p.Name,
    Category = p.Age >= 30 ? "Senior" : "Junior"
});
\`\`\`

## Ordering
\`\`\`csharp
var sorted = people
    .OrderBy(p => p.Age)
    .ThenByDescending(p => p.Name);
\`\`\`

## Aggregation
\`\`\`csharp
int[] nums = { 1, 2, 3, 4, 5 };

int sum = nums.Sum();           // 15
int count = nums.Count();       // 5
int max = nums.Max();           // 5
double avg = nums.Average();    // 3.0
\`\`\`

## Joining
\`\`\`csharp
var joined = from p in people
             join o in orders on p.Id equals o.PersonId
             select new { p.Name, o.Total };
\`\`\`

## Deferred vs Immediate Execution
\`\`\`csharp
var query = numbers.Where(n => n > 5);  // Deferred - not executed yet

// Executed when:
int[] result = query.ToArray();  // Immediate
foreach (var n in query) { }      // Immediate
\`\`\``,
    `// LINQ practice
using System;
using System.Linq;
using System.Collections.Generic;

class Product
{
    public string Name { get; set; }
    public string Category { get; set; }
    public decimal Price { get; set; }
}

class Program
{
    static void Main()
    {
        var products = new List<Product>
        {
            new Product { Name = "Laptop", Category = "Electronics", Price = 999 },
            new Product { Name = "Shirt", Category = "Clothing", Price = 29 },
            new Product { Name = "Phone", Category = "Electronics", Price = 699 },
            new Product { Name = "Pants", Category = "Clothing", Price = 49 },
            new Product { Name = "Tablet", Category = "Electronics", Price = 499 }
        };
        
        // All electronics
        var electronics = products.Where(p => p.Category == "Electronics");
        Console.WriteLine("Electronics:");
        foreach (var p in electronics)
            Console.WriteLine(\$"  {p.Name}: {p.Price}");
        
        // Average price of electronics
        var avgPrice = products.Where(p => p.Category == "Electronics").Average(p => p.Price);
        Console.WriteLine(\$"Avg electronics price: {avgPrice:F2}");
        
        // Most expensive
        var expensive = products.OrderByDescending(p => p.Price).First();
        Console.WriteLine($"Most expensive: {expensive.Name}");
        
        // Group by category
        var byCategory = products.GroupBy(p => p.Category);
        foreach (var group in byCategory)
        {
            Console.WriteLine(\$"{group.Key}: {group.Sum(p => p.Price)} total");
        }
    }
}`,
    "Given a list of students with Name, Score, and Grade, use LINQ to find the average score by grade and list top performers."
  ),

  "csharp-async-await": lesson(
    `# Async/Await in C#

Asynchronous programming prevents UI freezing and improves scalability.

## Why Async?
\`\`\`csharp
// Synchronous - blocks thread
var result = DoWork();  // Thread waits

// Asynchronous - releases thread
var result = await DoWorkAsync();  // Thread free to do other work
\`\`\`

## Basic Pattern
\`\`\`csharp
public async Task<string> FetchDataAsync()
{
    // Simulate async operation
    await Task.Delay(1000);
    return "Data loaded!";
}

// Calling async method
public async Task UseDataAsync()
{
    Console.WriteLine("Loading...");
    string data = await FetchDataAsync();
    Console.WriteLine(data);
}
\`\`\`

## Async Methods
\`\`\`csharp
// Return Task<T> for value-returning methods
public async Task<int> CalculateAsync()
{
    await Task.Delay(100);
    return 42;
}

// Return Task for void-returning (event handlers)
public async void Button_Click(object sender, EventArgs e)
{
    await LoadDataAsync();
}

// Multiple async operations
public async Task DoMultipleAsync()
{
    Task t1 = Operation1Async();
    Task t2 = Operation2Async();
    
    await Task.WhenAll(t1, t2);
}
\`\`\`

## Task Parallelism
\`\`\`csharp
// Sequential (slow)
var result1 = await DoSomethingAsync();
var result2 = await DoOtherAsync();

// Parallel (faster)
var task1 = DoSomethingAsync();
var task2 = DoOtherAsync();
await Task.WhenAll(task1, task2);
var results = await Task.WhenAll(task1, task2);
\`\`\`

## Exception Handling
\`\`\`csharp
try
{
    await RiskyOperationAsync();
}
catch (Exception ex)
{
    Console.WriteLine($"Error: {ex.Message}");
}

// For multiple tasks
try
{
    await Task.WhenAll(tasks);
}
catch (Exception ex)
{
    // AggregateException contains all exceptions
    foreach (var e in ((AggregateException)ex).InnerExceptions)
    {
        Console.WriteLine(e.Message);
    }
}
\`\`\`

## Cancellation
\`\`\`csharp
using var cts = new CancellationTokenSource();

public async Task DoWorkAsync(CancellationToken token)
{
    for (int i = 0; i < 100; i++)
    {
        token.ThrowIfCancellationRequested();
        await Task.Delay(100);
        Console.WriteLine(i);
    }
}

// Cancel after 5 seconds
cts.CancelAfter(5000);
await DoWorkAsync(cts.Token);
\`\`\``,
    `// Async download simulation
using System;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        Console.WriteLine("Starting downloads...");
        
        // Sequential (slow)
        var sw = System.Diagnostics.Stopwatch.StartNew();
        await DownloadFileAsync("file1");
        await DownloadFileAsync("file2");
        await DownloadFileAsync("file3");
        Console.WriteLine($"Sequential: {sw.ElapsedMilliseconds}ms");
        
        // Parallel (faster)
        sw.Restart();
        await Task.WhenAll(
            DownloadFileAsync("file1"),
            DownloadFileAsync("file2"),
            DownloadFileAsync("file3")
        );
        Console.WriteLine($"Parallel: {sw.ElapsedMilliseconds}ms");
    }
    
    static async Task DownloadFileAsync(string filename)
    {
        await Task.Delay(1000);  // Simulate download
        Console.WriteLine($"Downloaded: {filename}");
    }
}`,
    "Create an async method that downloads data from multiple URLs in parallel and returns all results, with proper exception handling."
  ),

  "csharp-generics": lesson(
    `# Generics in C#

Generics provide type safety and code reuse without boxing/unboxing.

## Generic Classes
\`\`\`csharp
public class Stack<T>
{
    private T[] items;
    private int count;
    
    public void Push(T item) { /* ... */ }
    public T Pop() { /* ... */ return default(T); }
}

var intStack = new Stack<int>();
var stringStack = new Stack<string>();
\`\`\`

## Generic Methods
\`\`\`csharp
public T FindMax<T>(T[] array) where T : IComparable<T>
{
    T max = array[0];
    foreach (T item in array)
    {
        if (item.CompareTo(max) > 0)
            max = item;
    }
    return max;
}

int maxInt = FindMax(new[] { 1, 5, 3 });    // 5
string maxStr = FindMax(new[] { "apple", "banana" });  // "banana"
\`\`\`

## Generic Constraints
\`\`\`csharp
// struct - value type
// class - reference type
// new() - has parameterless constructor
// : BaseClass - inherits from base
// : IInterface - implements interface

public class Factory<T> where T : new()
{
    public T Create() => new T();
}

public classComparer<T> where T : IComparable<T>
{
    public bool IsGreater(T a, T b) => a.CompareTo(b) > 0;
}
\`\`\`

## Multiple Type Parameters
\`\`\`csharp
public class Dictionary<TKey, TValue>
{
    public void Add(TKey key, TValue value) { /* ... */ }
    public TValue this[TKey key] { get; set; }
}

var ages = new Dictionary<string, int>();
ages.Add("Alice", 30);
\`\`\`

## Covariance & Contravariance
\`\`\`csharp
// out = covariant (output)
IEnumerable<Derived> derived = new List<Derived>();
IEnumerable<Base> base2 = derived;  // OK with IEnumerable<out T>

// in = contravariant (input)
IComparer<Base> baseComparer = new MyComparer();
IComparer<Derived> derivedComparer = baseComparer;  // OK with IComparer<in T>
\`\`\``,
    `// Generic linked list
using System;

public class Node<T>
{
    public T Value { get; set; }
    public Node<T> Next { get; set; }
    
    public Node(T value)
    {
        Value = value;
    }
}

public class LinkedList<T>
{
    private Node<T> head;
    
    public void Add(T value)
    {
        var newNode = new Node<T>(value);
        newNode.Next = head;
        head = newNode;
    }
    
    public void ForEach(Action<T> action)
    {
        var current = head;
        while (current != null)
        {
            action(current.Value);
            current = current.Next;
        }
    }
}

class Program
{
    static void Main()
    {
        var list = new LinkedList<int>();
        list.Add(3);
        list.Add(2);
        list.Add(1);
        
        Console.WriteLine("List contents:");
        list.ForEach(n => Console.WriteLine(n));
    }
}`,
    "Create a generic Queue<T> class with Enqueue, Dequeue, Peek, and Count methods."
  ),

};

// =============================================================================
// GO LESSONS
// =============================================================================

const GO_LESSONS: Record<string, LessonContent> = {

  "go-setup-basics": lesson(
    `# Go Setup & Basics

Go (Golang) is a statically typed, compiled language designed for simplicity and efficiency.

## Installation

### Windows
Download from https://go.dev/dl/

### macOS
\`\`\`bash
brew install go
\`\`\`

### Verify Installation
\`\`\`bash
go version
go env GOPATH
\`\`\`

## Your First Program
\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
\`\`\`

## Basic Syntax

### Variables
\`\`\`go
// Explicit type
var name string = "Alice"
var age int = 30

// Type inference
var message = "Hello"

// Short declaration (inside functions)
count := 0
price := 19.99

// Multiple declarations
var (
    firstName = "John"
    lastName  = "Doe"
)
\`\`\`

### Zero Values
Every variable has a zero value:
- 0 for numeric types
- false for booleans
- "" for strings
- nil for pointers, slices, maps, etc.

\`\`\`go
var i int      // 0
var b bool     // false
var s string   // ""
\`\`\`

### Constants
\`\`\`go
const Pi = 3.14159
const (
    StatusOK    = 200
    StatusError = 500
)
\`\`\``,
    `package main

import "fmt"

func main() {
    // Declare and use variables
    name := "Go Developer"
    age := 25
    height := 1.75
    isEmployed := true
    
    fmt.Printf("Name: %s\\n", name)
    fmt.Printf("Age: %d\\n", age)
    fmt.Printf("Height: %.2f m\\n", height)
    fmt.Printf("Employed: %t\\n", isEmployed)
    
    // Constants
    const Version = "1.0"
    fmt.Printf("Version: %s\\n", Version)
}`,
    "Create a Go program that declares variables for a book (title, author, year, price) and prints them using fmt.Printf."
  ),

  "go-types-variables": lesson(
    `# Types & Variables in Go

Go has a rich type system with clear semantics.

## Basic Types

### Integers
\`\`\`go
// Signed
int8   // -128 to 127
int16  // -32768 to 32767
int32  // ~-2B to ~2B
int64  // huge range
int    // platform-dependent (usually 64-bit)

// Unsigned
uint8   // 0 to 255
uint16  // 0 to 65535
uint32
uint64
uint    // platform-dependent

// Aliases
byte    // alias for uint8
rune    // alias for int32 (Unicode code point)
uintptr // unsigned int for pointer storage
\`\`\`

### Floating Point
\`\`\`go
float32 // ~6-7 decimal digits
float64 // ~15 decimal digits (preferred)

pi := 3.1415926535  // float64 by default
\`\`\`

### Strings
\`\`\`go
s := "Hello, 世界"  // UTF-8 by default
len(s)               // length in bytes
for i, r := range s  // iterate over runes
\`\`\`

### Booleans
\`\`\`go
b := true
isValid := false
\`\`\`

## Type Conversion
\`\`\`go
i := 42
f := float64(i)  // int to float64
u := uint(i)      // int to uint

s := string(65)   // "A" (Unicode code point)
\`\`\`

## Arrays vs Slices
\`\`\`go
// Array - fixed size
var arr [5]int = [5]int{1, 2, 3, 4, 5}

// Slice - dynamic, more common
slice := []int{1, 2, 3}
slice = append(slice, 4, 5)
\`\`\`

## Maps
\`\`\`go
ages := map[string]int{
    "Alice": 30,
    "Bob":   25,
}
ages["Charlie"] = 35
delete(ages, "Bob")
\`\`\``,
    `package main

import "fmt"

func main() {
    // Integer types
    var (
        smallInt int8  = 127
        bigInt   int64 = 1 << 62
    )
    fmt.Printf("smallInt: %d, bigInt: %d\\n", smallInt, bigInt)
    
    // Float
    pi := 3.1415926535
    fmt.Printf("Pi: %.10f\\n", pi)
    
    // Map
    capitals := map[string]string{
        "USA":     "Washington DC",
        "France":  "Paris",
        "Japan":   "Tokyo",
    }
    
    fmt.Println("Capitals:")
    for country, capital := range capitals {
        fmt.Printf("  %s -> %s\\n", country, capital)
    }
    
    // Check if key exists
    if capital, ok := capitals["Germany"]; ok {
        fmt.Println("Germany capital:", capital)
    } else {
        fmt.Println("Germany not found")
    }
}`,
    "Create a Go program that uses a map to store student grades, calculates the average, and finds the highest grade."
  ),

  "go-control-flow": lesson(
    `# Control Flow in Go

Go has clean, straightforward control structures.

## if Statement
\`\`\`go
if score := 85; score >= 90 {
    fmt.Println("A")
} else if score >= 80 {
    fmt.Println("B")
} else {
    fmt.Println("C or below")
}
\`\`\`

## switch Statement
\`\`\`go
day := "Monday"

switch day {
case "Monday", "Tuesday", "Wednesday", "Thursday", "Friday":
    fmt.Println("Weekday")
case "Saturday", "Sunday":
    fmt.Println("Weekend")
default:
    fmt.Println("Invalid")
}

// No break needed - Go auto-breaks!

// switch with expressions
switch {
case score >= 90:
    fmt.Println("A")
case score >= 80:
    fmt.Println("B")
}
\`\`\`

## for Loop (only loop in Go)
\`\`\`go
// Traditional
for i := 0; i < 5; i++ {
    fmt.Println(i)
}

// While-style
n := 5
for n > 0 {
    fmt.Println(n)
    n--
}

// Infinite loop
for {
    // break to exit
}

// Range loop
fruits := []string{"apple", "banana", "cherry"}
for index, value := range fruits {
    fmt.Printf("%d: %s\\n", index, value)
}

// Skip index
for _, value := range fruits {
    fmt.Println(value)
}
\`\`\`

## defer
\`\`\`go
func readFile(filename string) {
    file, _ := os.Open(filename)
    defer file.Close()  // Executes at function end
    
    // Use file...
}
\`\`\`

## panic & recover
\`\`\`go
func safeCall() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered:", r)
        }
    }()
    panic("Something went wrong")
}
\`\`\``,
    `package main

import "fmt"

func main() {
    // FizzBuzz
    for i := 1; i <= 20; i++ {
        switch {
        case i%15 == 0:
            fmt.Println("FizzBuzz")
        case i%3 == 0:
            fmt.Println("Fizz")
        case i%5 == 0:
            fmt.Println("Buzz")
        default:
            fmt.Println(i)
        }
    }
    
    // Using defer
    defer fmt.Println("This prints last")
    defer fmt.Println("This prints second")
    fmt.Println("This prints first")
}`,
    "Write a program that uses a for loop with range to iterate over a string and count vowels and consonants."
  ),

  "go-functions": lesson(
    `# Functions in Go

Go functions support multiple return values and first-class functions.

## Basic Functions
\`\`\`go
func add(a, b int) int {
    return a + b
}
\`\`\`

## Multiple Return Values
\`\`\`go
func divide(a, b int) (int, int) {
    return a / b, a % b  // quotient, remainder
}

quotient, remainder := divide(10, 3)
\`\`\`

## Named Return Values
\`\`\`go
func split(sum int) (x, y int) {
    x = sum * 4 / 9
    y = sum - x
    return  // naked return
}
\`\`\`

## Error Handling
\`\`\`go
func sqrt(n float64) (float64, error) {
    if n < 0 {
        return 0, errors.New("negative number")
    }
    return math.Sqrt(n), nil
}

result, err := sqrt(-4)
if err != nil {
    fmt.Println("Error:", err)
} else {
    fmt.Println(result)
}
\`\`\`

## Variadic Functions
\`\`\`go
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

sum(1, 2, 3, 4, 5)  // 15
sum(1, 2)            // 3
\`\`\`

## Function Values
\`\`\`go
add := func(a, b int) int {
    return a + b
}
fmt.Println(add(1, 2))  // 3
\`\`\`

## Closures
\`\`\`go
func counter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}

next := counter()
fmt.Println(next())  // 1
fmt.Println(next())  // 2
fmt.Println(next())  // 3
\`\`\``,
    `package main

import (
    "errors"
    "fmt"
)

func factorial(n int) (int, error) {
    if n < 0 {
        return 0, errors.New("negative number")
    }
    if n == 0 || n == 1 {
        return 1, nil
    }
    result := 1
    for i := 2; i <= n; i++ {
        result *= i
    }
    return result, nil
}

func main() {
    numbers := []int{5, 0, -1, 10}
    
    for _, n := range numbers {
        result, err := factorial(n)
        if err != nil {
            fmt.Printf("factorial(%d): Error: %s\\n", n, err)
        } else {
            fmt.Printf("factorial(%d) = %d\\n", n, result)
        }
    }
}`,
    "Create a function that returns a closure for generating Fibonacci numbers, then use it to print the first 10 Fibonacci numbers."
  ),

  "go-slices-maps": lesson(
    `# Slices & Maps in Go

Slices and maps are fundamental data structures in Go.

## Slices

### Creating Slices
\`\`\`go
// From array
arr := [5]int{1, 2, 3, 4, 5}
slice := arr[1:4]  // [2, 3, 4]

// Using make
slice := make([]int, 5)      // len=5, cap=5
slice := make([]int, 0, 10)   // len=0, cap=10

// Literals
slice := []int{1, 2, 3}
\`\`\`

### Slice Properties
\`\`\`go
slice := []int{1, 2, 3, 4, 5}
len(slice)  // 5
cap(slice)  // 5 (or more if backed by larger array)

slice = append(slice, 6, 7)  // Add elements
\`\`\`

### Slicing Operations
\`\`\`go
s := []int{0, 1, 2, 3, 4}
s[1:3]   // [1, 2]
s[:3]    // [0, 1, 2]
s[3:]    // [3, 4]
\`\`\`

## Maps

### Creating Maps
\`\`\`go
// Using make
ages := make(map[string]int)

// Using map literal
ages := map[string]int{
    "Alice": 30,
    "Bob":   25,
}
\`\`\`

### Map Operations
\`\`\`go
ages := map[string]int{"Alice": 30}

// Insert/Update
ages["Charlie"] = 35

// Retrieve
age := ages["Alice"]  // 30
age := ages["Unknown"] // 0 (no error!)

// Check existence
if age, ok := ages["Bob"]; ok {
    fmt.Println("Bob's age:", age)
} else {
    fmt.Println("Bob not found")
}

// Delete
delete(ages, "Bob")
\`\`\`

### Iterating Maps
\`\`\`go
for key, value := range map {
    fmt.Printf("%s -> %v\\n", key, value)
}
\`\`\``,
    `package main

import "fmt"

func main() {
    // Slice operations
    nums := []int{10, 20, 30, 40, 50}
    fmt.Println("Original:", nums)
    
    // Append
    nums = append(nums, 60, 70)
    fmt.Println("After append:", nums)
    
    // Slice a slice
    middle := nums[1:4]
    fmt.Println("Middle elements:", middle)
    
    // Maps
    wordCount := map[string]int{
        "hello": 1,
        "world": 2,
    }
    
    text := []string{"hello", "world", "hello", "go", "world", "hello"}
    
    // Count word occurrences
    for _, word := range text {
        wordCount[word]++
    }
    
    fmt.Println("\\nWord counts:")
    for word, count := range wordCount {
        fmt.Printf("  %s: %d\\n", word, count)
    }
}`,
    "Create a function that takes a slice of integers and returns the median value."
  ),

  "go-structs-methods": lesson(
    `# Structs & Methods in Go

Go uses structs for data structures and methods for OOP-like behavior.

## Structs
\`\`\`go
type Person struct {
    Name string
    Age  int
    Email string
}

// Creating instances
p1 := Person{Name: "Alice", Age: 30}
p2 := Person{"Bob", 25, ""}  // Positional (less clear)
p3 := new(Person)           // Returns *Person

// Accessing fields
fmt.Println(p1.Name)
p1.Age = 31
\`\`\`

## Methods
\`\`\`go
type Rectangle struct {
    Width, Height float64
}

// Value receiver
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

// Pointer receiver (modify the struct)
func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}

rect := Rectangle{Width: 10, Height: 5}
fmt.Println(rect.Area())  // 50
rect.Scale(2)
fmt.Println(rect.Area())  // 200
\`\`\`

## Struct Embedding (Inheritance-like)
\`\`\`go
type Animal struct {
    Name string
}

func (a Animal) Speak() {
    fmt.Println("...")
}

type Dog struct {
    Animal  // Embedded (no field name)
    Breed  string
}

func (d Dog) Speak() {
    fmt.Println("Woof!")
}

d := Dog{
    Animal: Animal{Name: "Buddy"},
    Breed: "Labrador",
}
d.Speak()       // "Woof!" (Dog's method)
d.Animal.Speak() // "..."
\`\`\``,
    `package main

import "fmt"
import "math"

type Circle struct {
    Radius float64
}

type Shape interface {
    Area() float64
    Perimeter() float64
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * math.Pi * c.Radius
}

func printShapeInfo(s Shape) {
    fmt.Printf("Area: %.2f, Perimeter: %.2f\\n", s.Area(), s.Perimeter())
}

func main() {
    c := Circle{Radius: 5}
    printShapeInfo(c)
    
    // Using method directly
    fmt.Printf("Circle Area: %.2f\\n", c.Area())
}`,
    "Create a struct 'BankAccount' with fields for account number, holder name, and balance. Add methods for Deposit and Withdraw with proper validation."
  ),

  "go-interfaces": lesson(
    `# Interfaces in Go

Interfaces define behavior contracts without implementation.

## Basic Interfaces
\`\`\`go
type Writer interface {
    Write([]byte) (int, error)
}

type Closer interface {
    Close() error
}

// Implementing interface
type ConsoleWriter struct{}

func (cw ConsoleWriter) Write(data []byte) (int, error) {
    fmt.Println(string(data))
    return len(data), nil
}
\`\`\`

## Empty Interface
\`\`\`go
var anything interface{} = 42
anything = "string"

fmt.Printf("Value: %v, Type: %T\\n", anything, anything)

// Function that accepts anything
func PrintAny(v interface{}) {
    fmt.Println(v)
}
\`\`\`

## Type Assertions & Switch
\`\`\`go
var i interface{} = "hello"

// Type assertion (may panic if wrong)
s := i.(string)
fmt.Println(s)

// Safe type assertion with comma idiom
s, ok := i.(string)
if ok {
    fmt.Println(s)
}

// Type switch
switch v := i.(type) {
case string:
    fmt.Println("String:", v)
case int:
    fmt.Println("Int:", v)
default:
    fmt.Println("Unknown type")
}
\`\`\`

## Common Interfaces
\`\`\`go
// Stringer (used by fmt.Println)
type Stringer interface {
    String() string
}

// Error
type error interface {
    Error() string
}
\`\`\`

## Interface Composition
\`\`\`go
type ReadWriteCloser interface {
    Reader
    Writer
    Closer
}
\`\`\``,
    `package main

import "fmt"

type Shape interface {
    Area() float64
    Name() string
}

type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r Rectangle) Name() string {
    return "Rectangle"
}

type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return 3.14159 * c.Radius * c.Radius
}

func (c Circle) Name() string {
    return "Circle"
}

func printInfo(s Shape) {
    fmt.Printf("%s with area: %.2f\\n", s.Name(), s.Area())
}

func main() {
    shapes := []Shape{
        Rectangle{Width: 10, Height: 5},
        Circle{Radius: 7},
        Rectangle{Width: 3, Height: 3},
    }
    
    for _, s := range shapes {
        printInfo(s)
    }
}`,
    "Create an interface 'Formatter' with a Format() string method. Implement it for at least 3 different types."
  ),

  "go-goroutines-channels": lesson(
    `# Goroutines & Channels

Go's concurrency model is built on goroutines and channels.

## Goroutines
\`\`\`go
import "time"

// Regular function
func sayHello() {
    fmt.Println("Hello!")
}

// Start goroutine (async)
go sayHello()

// Anonymous function goroutine
go func() {
    fmt.Println("Running in background")
}()
\`\`\`

## WaitGroup
\`\`\`go
import "sync"

var wg sync.WaitGroup

for i := 0; i < 5; i++ {
    wg.Add(1)  // Increment counter
    go func(id int) {
        defer wg.Done()  // Decrement when done
        fmt.Printf("Worker %d\\n", id)
    }(i)
}

wg.Wait()  // Block until counter is 0
\`\`\`

## Channels
\`\`\`go
ch := make(chan int)        // Unbuffered
ch := make(chan int, 5)     // Buffered with capacity 5

// Send to channel
ch <- 42

// Receive from channel
value := <-ch

// Close channel
close(ch)
\`\`\`

## Channel Patterns
\`\`\`go
// Producer
func producer(ch chan int) {
    for i := 0; i < 5; i++ {
        ch <- i
    }
    close(ch)
}

// Consumer
func consumer(ch chan int) {
    for v := range ch {
        fmt.Println(v)
    }
}

// Usage
ch := make(chan int)
go producer(ch)
consumer(ch)
\`\`\`

## Select Statement
\`\`\`go
select {
case msg1 := <-ch1:
    fmt.Println("Received from ch1:", msg1)
case msg2 := <-ch2:
    fmt.Println("Received from ch2:", msg2)
case <-time.After(time.Second):
    fmt.Println("Timeout!")
}
\`\`\``,
    `package main

import (
    "fmt"
    "sync"
    "time"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for job := range jobs {
        fmt.Printf("Worker %d processing job %d\\n", id, job)
        time.Sleep(100 * time.Millisecond)
        results <- job * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    var wg sync.WaitGroup
    
    // Start 3 workers
    for w := 1; w <= 3; w++ {
        wg.Add(1)
        go worker(w, jobs, results, &wg)
    }
    
    // Send jobs
    for j := 1; j <= 10; j++ {
        jobs <- j
    }
    close(jobs)
    
    // Wait and collect results
    go func() {
        wg.Wait()
        close(results)
    }()
    
    for result := range results {
        fmt.Printf("Result: %d\\n", result)
    }
}`,
    "Create a concurrent pipeline that reads numbers, squares them, and prints results using goroutines and channels."
  ),

};

// =============================================================================
// RUST LESSONS
// =============================================================================

const RUST_LESSONS: Record<string, LessonContent> = {

  "rust-setup-variables": lesson(
    `# Cargo & Variables in Rust

Rust is a systems programming language focused on safety, speed, and concurrency.

## Installation

### Windows
Download from https://rustup.rs

### Verify
\`\`\`bash
rustc --version
cargo --version
\`\`\`

## Your First Project
\`\`\`bash
cargo new hello_world
cd hello_world
cargo run
\`\`\`

## Variables

### Basic Variables
\`\`\`rust
let x = 5;              // Immutable
let mut y = 5;          // Mutable
y = 6;                  // OK

let z: i32 = 10;        // Explicit type
\`\`\`

### Shadowing
\`\`\`rust
let x = 5;
let x = x + 1;  // Shadows previous x
let x = "str";  // Can change type with shadowing

let mut y = 5;
y = "str";      // ERROR: can't change type
\`\`\`

### Constants
\`\`\`rust
const MAX_SCORE: i32 = 100;
const PI: f64 = 3.14159;
\`\`\`

## Basic Types

### Integers
\`\`\`rust
let a: i8 = -128;    // Signed 8-bit
let b: u8 = 255;     // Unsigned 8-bit
let c: i32 = 42;     // Default signed int
let d: isize = 10;  // Platform-dependent
let e: usize = 10;
\`\`\`

### Floats
\`\`\`rust
let f: f32 = 3.14;   // 32-bit
let g: f64 = 3.14;   // 64-bit (default)
\`\`\`

### Booleans
\`\`\`rust
let is_active = true;
let is_valid: bool = false;
\`\`\`

### Characters & Strings
\`\`\`rust
let c: char = 'A';           // 4-byte Unicode
let s: &str = "hello";       // String slice
let s2: String = String::from("hello");  // Owned string
\`\`\``,
    `fn main() {
    // Variables
    let mut age = 25;
    age = 26;  // Mutable
    
    // Constants
    const PI: f64 = 3.14159;
    
    // Types
    let integer: i32 = -42;
    let float: f64 = 3.14;
    let letter: char = 'R';
    let is_rust: bool = true;
    
    println!("Age: {}", age);
    println!("PI: {:.5}", PI);
    println!("Integer: {}, Float: {}", integer, float);
    println!("Letter: {}, Is Rust: {}", letter, is_rust);
    
    // Shadowing
    let text = "hello";
    let text = text.len();
    println!("Text length: {}", text);
}`,
    "Create a Rust program that declares variables of different types (i32, f64, bool, char) and prints their values with appropriate formatting."
  ),

  "rust-ownership-borrowing": lesson(
    `# Ownership & Borrowing

Rust's unique memory management system ensures safety without garbage collection.

## Ownership Rules

1. Each value has one owner
2. There can only be one owner at a time
3. When the owner goes out of scope, the value is dropped

\`\`\`rust
let s1 = String::from("hello");
let s2 = s1;  // s1 is MOVED to s2
// println!("{}", s1);  // ERROR: s1 no longer valid

let x = 5;
let y = x;    // x is COPIED (stack types)
println!("x = {}, y = {}", x);  // OK
\`\`\`

## Clone & Copy

\`\`\`rust
let s1 = String::from("hello");
let s2 = s1.clone();  // Deep copy, both valid
println!("{} and {}", s1, s2);

// Types with Copy trait can use =
let x = 5;
let y = x;  // No clone needed
\`\`\`

## References & Borrowing

\`\`\`rust
fn calculate_length(s: &String) -> usize {
    s.len()
}  // s goes out of scope, but doesn't own the value

let s = String::from("hello");
let len = calculate_length(&s);  // Pass reference
println!("Length of '{}' is {}", s, len);  // s still valid
\`\`\`

## Mutable References

\`\`\`rust
fn append_world(s: &mut String) {
    s.push_str(", world");
}

let mut s = String::from("hello");
append_world(&mut s);
println!("{}", s);  // "hello, world"
\`\`\`

## Borrowing Rules

1. One mutable reference OR multiple immutable references
2. References must always be valid (no dangling)

\`\`\`rust
let mut s = String::from("hello");

let r1 = &s;      // OK
let r2 = &s;      // OK (multiple immutable)
// let r3 = &mut s;  // ERROR: can't have mutable while immutable exist
println!("{} and {}", r1, r2);
// r1 and r2 no longer used after this point

let r3 = &mut s;  // OK now
\`\`\``,
    `fn main() {
    // Ownership
    let s1 = String::from("hello");
    let s2 = s1;  // s1 moved to s2
    
    // Can't use s1 anymore
    println!("s2: {}", s2);
    
    // Clone for deep copy
    let s3 = s2.clone();
    println!("s2: {}, s3: {}", s2, s3);
    
    // Borrowing (immutable)
    let len = calculate_length(&s2);
    println!("Length of '{}' is {}", s2, len);
    
    // Borrowing (mutable)
    let mut s4 = String::from("hello");
    modify(&mut s4);
    println!("Modified: {}", s4);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn modify(s: &mut String) {
    s.push_str(" world!");
}`,
    "Write a function that takes ownership of a String and returns its length, then another version that borrows and returns the length."
  ),

  "rust-structs-enums": lesson(
    `# Structs & Enums

Build complex data types with structs and enums.

## Structs

### Named Struct
\`\`\`rust
struct Person {
    name: String,
    age: u32,
    email: String,
}

let alice = Person {
    name: String::from("Alice"),
    age: 30,
    email: String::from("alice@example.com"),
};

println!("{} is {}", alice.name, alice.age);
\`\`\`

### Tuple Struct
\`\`\`rust
struct Point(i32, i32);
struct Color(u8, u8, u8);

let p = Point(10, 20);
let black = Color(0, 0, 0);

println!("({}, {})", p.0, p.1);
\`\`\`

### Unit Struct
\`\`\`rust
struct AlwaysEqual;
\`\`\`

## Methods on Structs
\`\`\`rust
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
    
    fn new(width: u32, height: u32) -> Self {
        Rectangle { width, height }
    }
    
    fn square(size: u32) -> Self {
        Self { width: size, height: size }
    }
}
\`\`\`

## Enums

### Basic Enum
\`\`\`rust
enum Direction {
    North,
    South,
    East,
    West,
}

let dir = Direction::North;
\`\`\`

### Enum with Data
\`\`\`rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(u8, u8, u8),
}

let m = Message::Move { x: 10, y: 20 };
\`\`\`

### Option Enum
\`\`\`rust
enum Option<T> {
    Some(T),
    None,
}

let x: Option<i32> = Some(5);
let y: Option<i32> = None;

if let Some(value) = x {
    println!("Got: {}", value);
}
\`\`\``,
    `struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn new(width: u32, height: u32) -> Self {
        Rectangle { width, height }
    }
    
    fn square(size: u32) -> Self {
        Rectangle { width: size, height: size }
    }
    
    fn area(&self) -> u32 {
        self.width * self.height
    }
    
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

fn main() {
    let rect = Rectangle::new(30, 50);
    let square = Rectangle::square(20);
    
    println!("Rectangle: {}x{} = {} sq units", 
             rect.width, rect.height, rect.area());
    println!("Square: {}x{} = {} sq units",
             square.width, square.height, square.area());
    println!("Rect can hold square: {}", rect.can_hold(&square));
}`,
    "Create an enum 'Shape' with variants Circle(f64), Rectangle(f64, f64), and Triangle(f64, f64, f64). Implement a method to calculate area for each."
  ),

  "rust-pattern-matching": lesson(
    `# Pattern Matching & Error Handling

Rust's powerful match expression and robust error handling.

## match Expression
\`\`\`rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u32 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
\`\`\`

## match with Values
\`\`\`rust
enum Message {
    Hello { id: u32 },
    Exit,
}

match msg {
    Message::Hello { id } if id < 10 => {
        println!("Small id: {}", id);
    }
    Message::Hello { id } => {
        println!("Large id: {}", id);
    }
    Message::Exit => {
        println!("Goodbye");
    }
}
\`\`\`

## if let
\`\`\`rust
let some_u8_value = Some(3u8);

if let Some(3) = some_u8_value {
    println!("Three!");
}
\`\`\`

## Result Enum
\`\`\`rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}

use std::fs::File;
use std::io::Read;

fn read_file(path: &str) -> Result<String, std::io::Error> {
    let mut file = File::open(path)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}
\`\`\`

## ? Operator
\`\`\`rust
fn read_username() -> Result<String, std::io::Error> {
    let mut file = File::open("config.txt")?;
    let mut s = String::new();
    file.read_to_string(&mut s)?;
    Ok(s)
}
\`\`\`

## unwrap and expect
\`\`\`rust
let x = Some("value").unwrap();      // Panic if None
let x = Some("value").expect("msg");  // Panic with message

let x = result.unwrap_or("default"); // Provide default
\`\`\``,
    `use std::fs::File;
use std::io::{self, Read};

fn main() {
    // Pattern matching with Option
    let some_value: Option<i32> = Some(42);
    let no_value: Option<i32> = None;
    
    match some_value {
        Some(n) => println!("Got value: {}", n),
        None => println!("No value"),
    }
    
    // if let pattern
    if let Some(n) = no_value {
        println!("{}", n);
    } else {
        println!("No value with if let");
    }
    
    // Simulated error handling
    match divide(10, 2) {
        Ok(result) => println!("10 / 2 = {}", result),
        Err(e) => println!("Error: {}", e),
    }
    
    match divide(10, 0) {
        Ok(result) => println!("{}", result),
        Err(e) => println!("{}", e),
    }
}

fn divide(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        Err("Division by zero".to_string())
    } else {
        Ok(a / b)
    }
}`,
    "Create a function that returns Result and use pattern matching with the ? operator to chain operations."
  ),

  "rust-vectors-strings": lesson(
    `# Vectors & Strings

Essential collection types in Rust.

## Vectors

### Creating Vectors
\`\`\`rust
let v: Vec<i32> = Vec::new();
let v = vec![1, 2, 3];
let v: Vec<i32> = (0..5).collect();
\`\`\`

### Adding Elements
\`\`\`rust
let mut v = Vec::new();
v.push(1);
v.push(2);
v.push(3);

// With macro
let mut v = vec![1, 2];
v.extend([4, 5, 6].iter());
\`\`\`

### Reading Elements
\`\`\`rust
let v = vec![1, 2, 3, 4, 5];

let third = v[2];        // Panics if out of bounds
let third = v.get(2);     // Returns Option<&T>
let third = v.get(2).unwrap_or(&0);

for i in &v {
    println!("{}", i);
}
\`\`\`

### Useful Methods
\`\`\`rust
let mut v = vec![1, 2, 3];
v.pop();          // Remove last
v.remove(0);      // Remove by index
v.len();          // Length
v.is_empty();     // Check empty
v.contains(&2);   // Check membership
\`\`\`

## Strings

### Creating Strings
\`\`\`rust
let s = String::new();
let s = "initial text".to_string();
let s = String::from("hello");
\`\`\`

### String Operations
\`\`\`rust
let mut s = String::from("hello");

s.push('.');           // Add char
s.push_str(" world");  // Add string slice
let s2 = s + "!";      // Concatenate (takes ownership)
let s3 = format!("{}{}", s, s2);  // Format macro

let len = s.len();     // Bytes, not chars!
let ch = &s[0..1];     // Get first character (bytes)
\`\`\`

### Iterating
\`\`\`rust
for c in "नमस्ते".chars() {
    println!("{}", c);
}

for b in "नमस्ते".bytes() {
    println!("{}", b);
}
\`\`\`

### String Methods
\`\`\`rust
let s = "  Hello, World!  ";

s.trim();           // "Hello, World!"
s.to_lowercase();   // "  hello, world!  "
s.contains("World"); // true
s.starts_with("  H"); // true
s.replace("World", "Rust"); // "  Hello, Rust!  "
\`\`\``,
    `fn main() {
    // Vector operations
    let mut numbers = vec![1, 2, 3, 4, 5];
    
    println!("Vector: {:?}", numbers);
    println!("Length: {}", numbers.len());
    println!("First: {:?}", numbers.first());
    println!("Last: {:?}", numbers.last());
    
    numbers.push(6);
    numbers.push(7);
    
    if let Some(val) = numbers.get(5) {
        println!("Element at 5: {}", val);
    }
    
    // Iterating
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
    
    // String operations
    let mut s = String::from("Hello");
    s.push(' ');
    s.push_str("Rust");
    
    println!("String: {}", s);
    println!("Uppercase: {}", s.to_uppercase());
    println!("Contains 'Rust': {}", s.contains("Rust"));
    
    // Split
    let words: Vec<&str> = s.split(' ').collect();
    println!("Words: {:?}", words);
}`,
    "Create a program that takes user input words, stores them in a Vector, sorts them alphabetically, and prints them."
  ),

  "rust-traits-generics": lesson(
    `# Traits & Generics

Traits define shared behavior; generics enable flexible, type-safe code.

## Traits

### Defining Traits
\`\`\`rust
trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
    author: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{} by {}", self.title, self.author)
    }
}
\`\`\`

### Default Implementation
\`\`\`rust
trait Summary {
    fn summarize(&self) -> String {
        String::from("(Read more...)")
    }
}
\`\`\`

### Traits as Parameters
\`\`\`rust
fn notify(item: &impl Summary) {
    println!("Breaking: {}", item.summarize());
}

// Equivalent to:
fn notify<T: Summary>(item: &T) {
    println!("Breaking: {}", item.summarize());
}
\`\`\`

## Generics

### Generic Functions
\`\`\`rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

let nums = vec![34, 50, 25, 100];
println!("{}", largest(&nums));
\`\`\`

### Generic Structs
\`\`\`rust
struct Point<T> {
    x: T,
    y: T,
}

struct Pair<T, U> {
    first: T,
    second: U,
}

let p1 = Point { x: 5, y: 10 };
let p2 = Point { x: 1.0, y: 4.0 };
\`\`\`

### Generic Implementation
\`\`\`rust
impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}
\`\`\`

## Trait Bounds
\`\`\`rust
use std::fmt::{Display, Debug};

fn notify<T: Summary + Display>(item: &T) { }

fn some_function<T, U>(t: &T, u: &U) -> String 
where 
    T: Display + Clone,
    U: Clone + Debug,
{
    // ...
}
\`\`\``,
    `use std::fmt::{Display, Debug};

#[derive(Debug)]
struct Rectangle<T> {
    width: T,
    height: T,
}

impl<T: PartialOrd + Copy + Display> Rectangle<T> {
    fn new(width: T, height: T) -> Self {
        Rectangle { width, height }
    }
    
    fn area(&self) -> f64 {
        let w = self.width.to_string().parse::<f64>().unwrap_or(0.0);
        let h = self.height.to_string().parse::<f64>().unwrap_or(0.0);
        w * h
    }
    
    fn is_square(&self) -> bool {
        self.width == self.height
    }
}

fn main() {
    let r1 = Rectangle { width: 30, height: 50 };
    let r2 = Rectangle { width: 20, height: 20 };
    
    println!("{:?}", r1);
    println!("r1 area: {}", r1.area());
    println!("r2 is square: {}", r2.is_square());
}`,
    "Create a generic Stack<T> struct with push, pop, peek, is_empty, and len methods."
  ),

  "rust-error-handling": lesson(
    `# Error Handling in Rust

Rust has no exceptions - errors are handled explicitly with Result and Option.

## Result Type
\`\`\`rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}

// Standard library example
use std::fs::File;
use std::io::Read;

fn read_file(path: &str) -> Result<String, std::io::Error> {
    let mut file = File::open(path)?;  // ? propagates errors
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}
\`\`\`

## ? Operator
\`\`\`rust
fn get_last_char(path: &str) -> Result<char, std::io::Error> {
    let contents = std::fs::read_to_string(path)?;
    let last_char = contents.chars().last();
    // Option to Result conversion
    Ok(last_char.ok_or("Empty file")?)
}
\`\`\`

## Custom Error Types
\`\`\`rust
use std::fmt;

#[derive(Debug)]
enum MyError {
    IoError(std::io::Error),
    ParseError(std::num::ParseIntError),
    Custom(String),
}

impl fmt::Display for MyError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            MyError::IoError(e) => write!(f, "IO error: {}", e),
            MyError::ParseError(e) => write!(f, "Parse error: {}", e),
            MyError::Custom(s) => write!(f, "{}", s),
        }
    }
}

impl From<std::io::Error> for MyError {
    fn from(err: std::io::Error) -> Self {
        MyError::IoError(err)
    }
}
\`\`\`

## Handling Errors
\`\`\`rust
match read_file("config.txt") {
    Ok(contents) => println!("{}", contents),
    Err(e) => eprintln!("Error: {}", e),
}

// With if let
if let Ok(contents) = read_file("config.txt") {
    println!("{}", contents);
}

// unwrap_or_else
let contents = read_file("config.txt")
    .unwrap_or_else(|_| String::from("default content"));
\`\`\`

## unwrap and expect
\`\`\`rust
let contents = File::open("config.txt")
    .expect("Failed to open config.txt")
    .read_to_string()
    .expect("Failed to read config.txt");
\`\`\``,
    `use std::fs::File;
use std::io::{self, Read};

fn read_integer_file(path: &str) -> Result<i32, String> {
    let mut file = File::open(path)
        .map_err(|e| format!("Failed to open {}: {}", path, e))?;
    
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| format!("Failed to read {}: {}", path, e))?;
    
    contents.trim()
        .parse::<i32>()
        .map_err(|e| format!("Failed to parse integer: {}", e))
}

fn main() {
    // Using the error handling function
    match read_integer_file("number.txt") {
        Ok(n) => println!("Read integer: {}", n),
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}`,
    "Create a function that parses a CSV line of numbers and returns a Vec<i32>, handling various error cases."
  ),



};

// =============================================================================
// RUBY LESSONS
// =============================================================================

const RUBY_LESSONS: Record<string, LessonContent> = {

  "ruby-setup-basics": lesson(
    `# Ruby Setup & Basics

Ruby is a dynamic, object-oriented language designed for programmer happiness.

## Installation

### Windows
Use RubyInstaller from https://rubyinstaller.org/

### macOS
\`\`\`bash
brew install ruby
\`\`\`

### Linux
\`\`\`bash
sudo apt install ruby-full
\`\`\`

## Your First Program
\`\`\`ruby
puts "Hello, World!"
\`\`\`

## Running Ruby
\`\`\`bash
ruby script.rb
irb        # Interactive Ruby shell
\`\`\`

## Variables
\`\`\`ruby
message = "Hello"
number = 42
price = 19.99
is_valid = true
\`\`\`

## Constants
\`\`\`ruby
MAX_SIZE = 100
Pi = 3.14159
\`\`\`

## Comments
\`\`\`ruby
# Single line comment

=begin
Multi-line
comment
=end
\`\`\`

## Data Types
\`\`\`ruby
# Numbers
42          # Integer
3.14        # Float
1_000_000   # Underscores for readability

# Strings
'hello'         # Single quotes - literal
"hello #{name}" # Double quotes - interpolation

# Symbols (interned strings)
:status
:user_id

# Booleans
true
false
nil             # Like None/null

# Arrays
[1, 2, 3]
['a', 'b', 'c']

# Hashes
{ name: 'Alice', age: 30 }
\`\`\`

## String Interpolation
\`\`\`ruby
name = 'Alice'
puts "Hello, #{name}!"
puts 'Hello, #{name}!'  # No interpolation in single quotes
\`\`\``,
    `# Ruby basics demonstration
puts "Hello from Ruby!"

# Variables
name = "Ruby Developer"
age = 25
height = 1.75
is_learning = true

puts "Name: #{name}"
puts "Age: #{age}"
puts "Height: #{height}m"
puts "Learning Ruby: #{is_learning}"

# String operations
greeting = "Hello"
world = "World"
puts greeting + " " + world
puts "#{greeting}, #{world}!"

# Using methods
puts name.upcase
puts name.reverse
puts name.length`,
    "Write a Ruby program that stores your favorite programming language in a variable and prints it in uppercase, lowercase, and with character count."
  ),

  "ruby-control-flow": lesson(
    `# Control Flow in Ruby

Ruby's control structures are expressive and English-like.

## if/else
\`\`\`ruby
if score >= 90
  puts "A"
elsif score >= 80
  puts "B"
else
  puts "C or below"
end

# One-liner
puts "A" if score >= 90
\`\`\`

## unless
\`\`\`ruby
unless age >= 18
  puts "Minor"
end

# One-liner
puts "Minor" unless age >= 18
\`\`\`

## case/when
\`\`\`ruby
case day
when "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
  puts "Weekday"
when "Saturday", "Sunday"
  puts "Weekend"
else
  puts "Invalid day"
end

# Case with comparison
case score
when 90..100
  puts "A"
when 80..89
  puts "B"
end
\`\`\`

## Loops

### while
\`\`\`ruby
i = 0
while i < 5
  puts i
  i += 1
end
\`\`\`

### until
\`\`\`ruby
i = 0
until i >= 5
  puts i
  i += 1
end
\`\`\`

### for
\`\`\`ruby
for i in 0..4
  puts i
end

# More common: each
(0..4).each do |i|
  puts i
end
\`\`\`

### Times
\`\`\`ruby
5.times do |i|
  puts "Count: #{i}"
end
\`\`\`

## Loop Control
\`\`\`ruby
# next - skip iteration
(1..10).each do |n|
  next if n.even?
  puts n
end

# break - exit loop
(1..10).each do |n|
  break if n > 5
  puts n
end
\`\`\``,
    `# FizzBuzz in Ruby
(1..20).each do |n|
  if n % 15 == 0
    puts "FizzBuzz"
  elsif n % 3 == 0
    puts "Fizz"
  elsif n % 5 == 0
    puts "Buzz"
  else
    puts n
  end
end

puts "\n-- Using case/when --"
(1..20).each do |n|
  case
  when n % 15 == 0 then puts "FizzBuzz"
  when n % 3 == 0 then puts "Fizz"
  when n % 5 == 0 then puts "Buzz"
  else puts n
  end
end`,
    "Write a Ruby program that iterates through numbers 1-100 and prints 'Fizz' for multiples of 3, 'Buzz' for multiples of 5, and 'FizzBuzz' for multiples of both."
  ),

  "ruby-arrays-hashes": lesson(
    `# Arrays & Hashes

Ruby's collections are powerful and flexible.

## Arrays

### Creating Arrays
\`\`\`ruby
arr = []
arr = Array.new
arr = [1, 2, 3, 4, 5]
arr = %w[apple banana cherry]  # Symbol to array
\`\`\`

### Accessing Elements
\`\`\`ruby
arr = [:a, :b, :c, :d, :e]
arr[0]       # :a
arr[-1]      # :e (last)
arr[1..3]    # [:b, :c, :d]
arr.first(3) # [:a, :b, :c]
\`\`\`

### Common Methods
\`\`\`ruby
arr = [3, 1, 4, 1, 5, 9, 2, 6]
arr.push(7)
arr << 8              # Append
arr.pop               # Remove last
arr.uniq              # Remove duplicates
arr.sort              # Sort
arr.reverse
arr.include?(5)      # Check membership
arr.join(", ")
\`\`\`

### Iterating Arrays
\`\`\`ruby
arr = [1, 2, 3, 4, 5]

arr.each { |n| puts n }
arr.each_with_index { |n, i| puts "#{i}: #{n}" }
arr.map { |n| n * 2 }           # Transform
arr.select { |n| n.even? }      # Filter
arr.reduce(:+)                  # Sum
\`\`\`

## Hashes

### Creating Hashes
\`\`\`ruby
hash = {}
hash = Hash.new
hash = { name: 'Alice', age: 30 }
hash = Hash.new(0)  # Default value
\`\`\`

### Accessing & Modifying
\`\`\`ruby
hash[:name]        # 'Alice'
hash[:city] = 'NYC'
hash.keys
hash.values
hash.has_key?(:name)
hash.has_value?('Alice')
\`\`\`

### Iterating Hashes
\`\`\`ruby
hash.each { |k, v| puts "#{k}: #{v}" }
hash.each_key { |k| puts k }
hash.each_value { |v| puts v }
\`\`\`

### Hash Methods
\`\`\`ruby
hash.merge(other_hash)
hash.delete(:age)
hash.keys.sort
hash.invert
\`\`\``,
    `# Array and Hash practice
# Arrays
fruits = ['apple', 'banana', 'cherry', 'date']
puts "Fruits: #{fruits}"
puts "First: #{fruits.first}"
puts "Last: #{fruits.last}"

# Array operations
numbers = [3, 1, 4, 1, 5, 9, 2, 6]
puts "\nNumbers: #{numbers}"
puts "Sorted: #{numbers.sort}"
puts "Unique: #{numbers.uniq}"
puts "Sum: #{numbers.reduce(0, :+)}"

# Array methods
doubles = numbers.map { |n| n * 2 }
evens = numbers.select { |n| n.even? }
puts "Doubles: #{doubles}"
puts "Evens: #{evens}"

# Hashes
student = { name: 'Alice', age: 25, grade: 'A' }
puts "\nStudent: #{student}"
puts "Name: #{student[:name]}"
student[:gpa] = 3.8
puts "Updated: #{student}"

# Hash iteration
puts "\nStudent details:"
student.each { |k, v| puts "  #{k}: #{v}" }`,
    "Create a Ruby program that stores a student's information in a hash, calculates their average score from an array of grades, and prints the results."
  ),

  "ruby-methods-procs": lesson(
    `# Methods, Procs & Lambdas

Ruby's approach to functions and callable objects.

## Methods

### Basic Methods
\`\`\`ruby
def greet(name)
  puts "Hello, #{name}!"
end

greet("Alice")
\`\`\`

### Return Values
\`\`\`ruby
def add(a, b)
  return a + b
end

# Ruby returns last expression automatically
def multiply(a, b)
  a * b
end
\`\`\`

### Default Parameters
\`\`\`ruby
def greet(name = "World")
  "Hello, #{name}!"
end

greet           # "Hello, World!"
greet("Alice")  # "Hello, Alice!"
\`\`\`

### Splat & Double Splat
\`\`\`ruby
def sum(*numbers)
  numbers.reduce(:+)
end

def configure(**options)
  options.each { |k, v| puts "#{k}: #{v}" }
end
\`\`\`

### Variable Scope
\`\`\`ruby
$x = 10  # Global

def method
  local = 20  # Local
  puts $x      # Accessible
  puts local
end
\`\`\`

## Blocks

### Each with Block
\`\`\`ruby
[1, 2, 3].each { |n| puts n }
[1, 2, 3].each do |n|
  puts n
end
\`\`\`

### Yield
\`\`\`ruby
def three_times
  yield
  yield
  yield
end

three_times { puts "Hello" }
\`\`\`

## Procs

\`\`\`ruby
square = Proc.new { |n| n ** 2 }
square.call(5)     # 25
square[5]          # Alternative syntax
square.(5)         # Another syntax
\`\`\`

## Lambdas

\`\`\`ruby
square = ->(n) { n ** 2 }
cube = lambda { |n| n ** 3 }

square.call(5)  # 25
cube.call(5)    # 125
\`\`\`

### Lambdas vs Procs
\`\`\`ruby
# Proc: doesn't check argument count
p = Proc.new { |a, b| puts "#{a}, #{b}" }
p.call(1, 2, 3)  # "1, 2"

# Lambda: strict argument count
l = ->(a, b) { puts "#{a}, #{b}" }
l.call(1, 2)     # "1, 2"
l.call(1, 2, 3)  # Error!
\`\`\``,
    `# Method and block practice
# Methods
def factorial(n)
  return 1 if n <= 1
  n * factorial(n - 1)
end

puts "Factorials:"
5.times { |i| puts " #{i+1}! = #{factorial(i+1)}" }

# Proc
double = Proc.new { |n| n * 2 }
puts "\nDoubles: #{[1, 2, 3, 4, 5].map(&double)}"

# Lambda
is_even = ->(n) { n.even? }
puts "Evens: #{[1, 2, 3, 4, 5].select(&is_even)}"

# Custom each
def my_each(collection)
  index = 0
  while index < collection.length
    yield(collection[index], index)
    index += 1
  end
end

puts "\nCustom each:"
my_each(['a', 'b', 'c']) { |item, idx| puts "#{idx}: #{item}" }`,
    "Write a Ruby method that takes a block, and use it to transform an array of numbers in different ways (square, cube, double)."
  ),

  "ruby-classes-oop": lesson(
    `# Classes & OOP in Ruby

Ruby is a pure OOP language - everything is an object.

## Defining Classes
\`\`\`ruby
class Person
  def initialize(name, age)
    @name = name
    @age = age
  end
  
  def greet
    "Hello, I'm #{@name}"
  end
end

alice = Person.new("Alice", 30)
puts alice.greet
\`\`\`

## Accessors
\`\`\`ruby
class Person
  attr_accessor :name, :age     # Read & write
  attr_reader :id               # Read only
  attr_writer :password         # Write only
end
\`\`\`

## Class Variables & Methods
\`\`\`ruby
class Counter
  @@count = 0
  
  def initialize
    @@count += 1
  end
  
  def self.total
    @@count
  end
end
\`\`\`

## Method Visibility
\`\`\`ruby
class Example
  def public_method
    "Public"
  end
  
  private
  def private_method
    "Private"
  end
  
  protected
  def protected_method
    "Protected"
  end
end
\`\`\`

## Inheritance
\`\`\`ruby
class Animal
  def speak
    "..."
  end
end

class Dog < Animal
  def speak
    "Woof!"
  end
end

class Cat < Animal
  def speak
    "Meow!"
  end
end
\`\`\`

## Mixins (Modules)
\`\`\`ruby
module Walkable
  def walk
    "Walking..."
  end
end

class Human
  include Walkable
end

human = Human.new
puts human.walk
\`\`\``,
    `# Bank Account class
class BankAccount
  attr_reader :account_number
  attr_accessor :holder_name
  
  @@interest_rate = 0.02
  
  def initialize(account_number, holder_name, initial_balance = 0)
    @account_number = account_number
    @holder_name = holder_name
    @balance = initial_balance
    @transactions = []
    log_transaction("Account created", initial_balance)
  end
  
  def balance
    @balance.round(2)
  end
  
  def deposit(amount)
    return false if amount <= 0
    @balance += amount
    log_transaction("Deposit", amount)
    true
  end
  
  def withdraw(amount)
    return false if amount <= 0 || amount > @balance
    @balance -= amount
    log_transaction("Withdrawal", -amount)
    true
  end
  
  def apply_interest
    interest = @balance * @@interest_rate
    @balance += interest
    log_transaction("Interest", interest)
  end
  
  def transaction_history
    @transactions.dup
  end
  
  private
  
  def log_transaction(type, amount)
    @transactions << { type: type, amount: amount, balance: @balance }
  end
end

account = BankAccount.new("12345", "Alice", 1000)
account.deposit(500)
account.withdraw(200)
account.apply_interest
puts "Balance: $#{account.balance}"
puts "History: #{account.transaction_history}"`,
    "Create a class hierarchy with a base 'Shape' class and subclasses 'Circle', 'Rectangle', and 'Triangle' with appropriate methods for calculating area."
  ),

  "ruby-blocks-enumerable": lesson(
    `# Blocks & Enumerable

Ruby's iterator pattern and Enumerable module.

## Enumerable Module
\`\`\`ruby
# Included in Array, Hash, Range, Set
[1, 2, 3].map { |n| n * 2 }     # [2, 4, 6]
[1, 2, 3].select { |n| n.even? } # [2]
[1, 2, 3].reject { |n| n.even? } # [1, 3]
[1, 2, 3].reduce(:+)             # 6
\`\`\`

## Common Enumerable Methods

### map (transform)
\`\`\`ruby
names = ['alice', 'bob', 'charlie']
names.map(&:capitalize)  # ['Alice', 'Bob', 'Charlie']
names.map { |n| n.upcase }
\`\`\`

### select (filter)
\`\`\`ruby
numbers = [1, 2, 3, 4, 5, 6]
numbers.select(&:odd?)   # [1, 3, 5]
numbers.reject(&:odd?)   # [2, 4, 6]
\`\`\`

### reduce (accumulate)
\`\`\`ruby
[1, 2, 3, 4].reduce(0) { |sum, n| sum + n }  # 10
[1, 2, 3, 4].reduce(:*)                       # 24
[1, 2, 3, 4].reduce({}) { |h, n| h.merge(n => n**2) }
\`\`\`

### find (detect)
\`\`\`ruby
numbers = [1, 2, 3, 4, 5]
numbers.find { |n| n > 3 }     # 4
numbers.detect { |n| n > 3 }   # 4 (alias)
\`\`\`

### group_by
\`\`\`ruby
words = ['apple', 'banana', 'apricot', 'blueberry']
words.group_by(&:first)
# {"a"=>["apple","apricot"], "b"=>["banana","blueberry"]}
\`\`\`

### partition
\`\`\`ruby
numbers = [1, 2, 3, 4, 5, 6]
evens, odds = numbers.partition(&:even?)
# evens = [2, 4, 6], odds = [1, 3, 5]
\`\`\`

### sort_by
\`\`\`ruby
words = ['cat', 'elephant', 'dog']
words.sort_by(&:length)  # ["cat", "dog", "elephant"]
\`\`\`

### Chain Methods
\`\`\`ruby
result = numbers
  .select(&:odd?)
  .map { |n| n * 2 }
  .sort
  .reverse
\`\`\``,
    `# Enumerable practice
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

puts "Original: #{numbers}"
puts "Squares: #{numbers.map { |n| n**2 }}"
puts "Evens: #{numbers.select(&:even?)}"
puts "Sum: #{numbers.reduce(0, :+)}"
puts "Count: #{numbers.count}"
puts "Min: #{numbers.min}, Max: #{numbers.max}"

# Chaining
result = numbers
  .select { |n| n > 3 }
  .map { |n| n * 2 }
  .reduce(0, :+)
puts "Sum of doubled > 3: #{result}"

# Group by
words = ['apple', 'apricot', 'banana', 'blueberry', 'cherry']
by_first = words.group_by { |w| w[0] }
puts "Grouped by first letter: #{by_first}"

# Partition
passing = [45, 72, 89, 55, 93, 61].partition { |n| n >= 60 }
puts "Passing: #{passing[0]}, Failing: #{passing[1]}"`,
    "Write a Ruby program that takes an array of student hashes (name, score) and uses Enumerable methods to find the top student, average score, and group students by pass/fail."
  ),

  "ruby-modules-mixins": lesson(
    `# Modules & Mixins

Modules provide namespaces and code sharing through mixins.

## Modules as Namespaces
\`\`\`ruby
module Math
  class Calculator
    def add(a, b)
      a + b
    end
  end
  
  PI = 3.14159
end

calc = Math::Calculator.new
puts Math::PI
\`\`\`

## Module Methods
\`\`\`ruby
module Converter
  def self.celsius_to_fahrenheit(c)
    c * 9 / 5 + 32
  end
  
  def self.fahrenheit_to_celsius(f)
    (f - 32) * 5 / 9
  end
end

puts Converter.celsius_to_fahrenheit(100)  # 212
\`\`\`

## Mixins
\`\`\`ruby
module Walkable
  def walk
    "Walking at #{speed} km/h"
  end
end

module Runnable
  def run
    "Running!"
  end
end

class Human
  include Walkable, Runnable
  
  def speed
    5
  end
end
\`\`\`

## include vs extend
\`\`\`ruby
module Greeting
  def say_hello
    "Hello!"
  end
end

class Person
  include Greeting  # Instance method
end

class Robot
  extend Greeting  # Class method
end

Person.new.say_hello   # "Hello!"
Robot.say_hello        # "Hello!"
\`\`\`

## Common Standard Library Mixins

### Enumerable
\`\`\`ruby
class Collection
  include Enumerable
  
  def initialize(items)
    @items = items
  end
  
  def each(&block)
    @items.each(&block)
  end
end
\`\`\`

### Comparable
\`\`\`ruby
class Temperature
  include Comparable
  
  attr_reader :celsius
  
  def initialize(celsius)
    @celsius = celsius
  end
  
  def <=>(other)
    @celsius <=> other.celsius
  end
end
\`\`\``,
    `# Module and mixin practice
module Printable
  def print_info
    puts to_s
  end
end

module Timestamped
  def timestamp
    @created_at ||= Time.now
  end
  
  def age
    Time.now - timestamp
  end
end

class Document
  include Printable, Timestamped
  attr_accessor :title, :content
  
  def initialize(title, content)
    @title = title
    @content = content
  end
  
  def to_s
    "Document: #{@title}\\nContent: #{@content}\\nCreated: #{timestamp}"
  end
end

doc = Document.new("Notes", "Some important notes")
doc.print_info
puts "Age: #{doc.age.round} seconds"

# Using module methods
module Formatter
  def self.format_date(date)
    date.strftime("%Y-%m-%d")
  end
  
  def self.format_currency(amount)
    "$#{'%.2f' % amount}"
  end
end

puts Formatter.format_date(Time.now)
puts Formatter.format_currency(99.9)`,
    "Create a module 'Comparable' that you can include in a class to give it comparison operators based on a single value."
  ),

  "ruby-exception-handling": lesson(
    `# Exception Handling in Ruby

Ruby's error handling with begin/rescue/ensure.

## Basic Exception Handling
\`\`\`ruby
begin
  result = 10 / 0
rescue ZeroDivisionError
  puts "Can't divide by zero!"
rescue StandardError => e
  puts "Error: #{e.message}"
end
\`\`\`

## else and ensure
\`\`\`ruby
begin
  file = File.open("data.txt")
  content = file.read
rescue Errno::ENOENT
  puts "File not found"
else
  puts "Read #{content.length} bytes"
ensure
  file.close if file
end
\`\`\`

## Raising Exceptions
\`\`\`ruby
def divide(a, b)
  raise ArgumentError, "Divisor can't be zero" if b == 0
  a / b
end

begin
  divide(10, 0)
rescue ArgumentError => e
  puts e.message
end
\`\`\`

## Custom Exceptions
\`\`\`ruby
class ValidationError < StandardError
  def initialize(field, message)
    @field = field
    super(message)
  end
  
  attr_reader :field
end

raise ValidationError.new(:email, "Invalid format")
\`\`\`

## rescue as Modifier
\`\`\`ruby
result = maybe_nil rescue default_value
number = gets.to_i rescue 0
\`\`\`

## Exception Methods
\`\`\`ruby
begin
  risky_operation
rescue => e
  puts e.class       # Exception class
  puts e.message     # Error message
  puts e.backtrace   # Stack trace
end
\`\`\`

## Retry
\`\`\`ruby
 attempts = 0
 begin
   connect_to_server
 rescue ConnectionError
   attempts += 1
   retry if attempts < 3
   puts "Failed after 3 attempts"
 end
\`\`\``,
    `# Exception handling practice
class BankAccount
  def initialize(balance)
    @balance = balance
  end
  
  def withdraw(amount)
    raise ArgumentError, "Amount must be positive" if amount <= 0
    raise "Insufficient funds" if amount > @balance
    
    @balance -= amount
    @balance
  rescue ArgumentError => e
    puts "Validation error: #{e.message}"
    nil
  rescue => e
    puts "Unexpected error: #{e.message}"
    nil
  ensure
    puts "Withdraw attempt completed"
  end
end

account = BankAccount.new(100)

puts "Scenario 1: Valid withdrawal"
account.withdraw(50)

puts "\\nScenario 2: Negative amount"
account.withdraw(-10)

puts "\\nScenario 3: Overdraft"
account.withdraw(200)

# Custom exception
class AuthenticationError < StandardError
  def initialize(user = nil)
    super("Authentication failed#{": #{user}" if user}")
  end
end

begin
  raise AuthenticationError.new("alice")
rescue AuthenticationError => e
  puts "Caught: #{e.message}"
end`,
    "Write a Ruby program that reads a file and parses it, handling FileNotFoundError, PermissionError, and parsing errors gracefully."
  ),

};

// =============================================================================
// COMBINED LESSONS MAP
// =============================================================================

const LESSONS: Record<string, LessonContent> = {
  ...PYTHON_LESSONS,
  ...JAVASCRIPT_LESSONS,
  ...C_LESSONS,
  ...JAVA_LESSONS,
  ...CPP_LESSONS,
  ...TYPESCRIPT_LESSONS,
  ...CSHARP_LESSONS,
  ...GO_LESSONS,
  ...RUST_LESSONS,
  ...RUBY_LESSONS,
};
