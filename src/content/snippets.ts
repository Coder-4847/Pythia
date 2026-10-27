/** Built-in playground snippets. `needs` lists the Pyodide packages a snippet imports. */
export interface Snippet {
  id: string
  title: string
  description: string
  needs?: string[]
  code: string
}

export const SNIPPETS: Snippet[] = [
  {
    id: 'hello',
    title: 'Hello, Pythia',
    description: 'Your first program',
    code: 'name = "world"\nprint(f"Hello, {name}!")\n',
  },
  {
    id: 'greeter',
    title: 'Ask and answer',
    description: 'input() and f-strings',
    code: 'name = input("What is your name? ")\nage = int(input("How old are you? "))\nprint(f"Hi {name}! Next year you will be {age + 1}.")\n',
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    description: 'Loops and conditionals',
    code: 'for n in range(1, 31):\n    if n % 15 == 0:\n        print("FizzBuzz")\n    elif n % 3 == 0:\n        print("Fizz")\n    elif n % 5 == 0:\n        print("Buzz")\n    else:\n        print(n)\n',
  },
  {
    id: 'word-count',
    title: 'Word counter',
    description: 'Dictionaries',
    code: 'text = "the quick brown fox jumps over the lazy dog the end"\ncounts = {}\nfor word in text.split():\n    counts[word] = counts.get(word, 0) + 1\n\nfor word, n in sorted(counts.items(), key=lambda kv: -kv[1]):\n    print(word, n)\n',
  },
  {
    id: 'comprehensions',
    title: 'Comprehensions',
    description: 'List, dict and set',
    code: 'squares = [n * n for n in range(10)]\nevens = {n for n in squares if n % 2 == 0}\nlookup = {n: n * n for n in range(5)}\nprint(squares)\nprint(sorted(evens))\nprint(lookup)\n',
  },
  {
    id: 'class',
    title: 'A small class',
    description: 'Objects and methods',
    code: 'class BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        if amount <= 0:\n            raise ValueError("Deposit must be positive")\n        self.balance += amount\n\n    def __repr__(self):\n        return f"BankAccount({self.owner!r}, {self.balance})"\n\n\nacct = BankAccount("Ada", 100)\nacct.deposit(50)\nprint(acct)\n',
  },
  {
    id: 'exceptions',
    title: 'Handling errors',
    description: 'try / except / finally',
    code: 'def parse_age(text):\n    try:\n        age = int(text)\n    except ValueError:\n        print(f"{text!r} is not a number")\n        return None\n    finally:\n        print("checked", repr(text))\n    return age\n\nparse_age("42")\nparse_age("forty-two")\n',
  },
  {
    id: 'generator',
    title: 'Fibonacci generator',
    description: 'yield',
    code: 'def fib():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\nfor i, value in zip(range(12), fib()):\n    print(i, value)\n',
  },
  {
    id: 'recursion',
    title: 'Recursion',
    description: 'Factorial and Fibonacci',
    code: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint([factorial(n) for n in range(8)])\n',
  },
  {
    id: 'numpy-basics',
    title: 'NumPy basics',
    description: 'Arrays and broadcasting',
    needs: ['numpy'],
    code: 'import numpy as np\n\na = np.arange(12).reshape(3, 4)\nprint(a)\nprint("column means:", a.mean(axis=0))\nprint("scaled:", (a - a.mean()) / a.std())\n',
  },
  {
    id: 'pandas-basics',
    title: 'pandas DataFrame',
    description: 'Group and aggregate',
    needs: ['pandas'],
    code: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "city": ["Oslo", "Oslo", "Rome", "Rome"],\n    "temp": [3, 5, 17, 19],\n})\nprint(df.groupby("city")["temp"].mean())\n',
  },
  {
    id: 'sine-plot',
    title: 'Plot a sine wave',
    description: 'Matplotlib, inline',
    needs: ['numpy', 'matplotlib'],
    code: 'import numpy as np\nimport matplotlib.pyplot as plt\n\nx = np.linspace(0, 2 * np.pi, 200)\nplt.plot(x, np.sin(x), label="sin")\nplt.plot(x, np.cos(x), label="cos")\nplt.legend()\nplt.title("Waves")\nplt.show()\n',
  },
  {
    id: 'sklearn-quick',
    title: 'Train a classifier',
    description: 'scikit-learn in 10 lines',
    needs: ['scikit-learn'],
    code: 'from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LogisticRegression\n\nX, y = load_iris(return_X_y=True)\nX_train, X_test, y_train, y_test = train_test_split(X, y, random_state=0)\nmodel = LogisticRegression(max_iter=200).fit(X_train, y_train)\nprint("accuracy:", round(model.score(X_test, y_test), 3))\n',
  },
]
