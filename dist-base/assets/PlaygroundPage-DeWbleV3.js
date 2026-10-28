import{r as e,t}from"./react-DvXU6kJ2.js";import{t as n}from"./jsx-runtime-BOy446NO.js";import{l as r}from"./chunk-OB3PAWPO-Cg04Slvu.js";import{t as i}from"./settings-iHJv5R9I.js";import{t as a}from"./cn-hZG6twJP.js";import{t as o}from"./Button-MV_Ex9TS.js";import{t as s}from"./Popover-DAb1_hVb.js";import{t as c}from"./toast-DD9KEb2Z.js";import{n as l,r as u,t as d}from"./store-BsMhyBBx.js";import{c as f,i as p,l as m,n as h,r as g,t as _}from"./useRunner-r5SzAX1u.js";import{t as v}from"./ConfirmDialog-DABfnmBa.js";var y=e(t(),1),b=[{id:`hello`,title:`Hello, Pythia`,description:`Your first program`,code:`name = "world"
print(f"Hello, {name}!")
`},{id:`greeter`,title:`Ask and answer`,description:`input() and f-strings`,code:`name = input("What is your name? ")
age = int(input("How old are you? "))
print(f"Hi {name}! Next year you will be {age + 1}.")
`},{id:`fizzbuzz`,title:`FizzBuzz`,description:`Loops and conditionals`,code:`for n in range(1, 31):
    if n % 15 == 0:
        print("FizzBuzz")
    elif n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    else:
        print(n)
`},{id:`word-count`,title:`Word counter`,description:`Dictionaries`,code:`text = "the quick brown fox jumps over the lazy dog the end"
counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1

for word, n in sorted(counts.items(), key=lambda kv: -kv[1]):
    print(word, n)
`},{id:`comprehensions`,title:`Comprehensions`,description:`List, dict and set`,code:`squares = [n * n for n in range(10)]
evens = {n for n in squares if n % 2 == 0}
lookup = {n: n * n for n in range(5)}
print(squares)
print(sorted(evens))
print(lookup)
`},{id:`class`,title:`A small class`,description:`Objects and methods`,code:`class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self.balance += amount

    def __repr__(self):
        return f"BankAccount({self.owner!r}, {self.balance})"


acct = BankAccount("Ada", 100)
acct.deposit(50)
print(acct)
`},{id:`exceptions`,title:`Handling errors`,description:`try / except / finally`,code:`def parse_age(text):
    try:
        age = int(text)
    except ValueError:
        print(f"{text!r} is not a number")
        return None
    finally:
        print("checked", repr(text))
    return age

parse_age("42")
parse_age("forty-two")
`},{id:`generator`,title:`Fibonacci generator`,description:`yield`,code:`def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

for i, value in zip(range(12), fib()):
    print(i, value)
`},{id:`recursion`,title:`Recursion`,description:`Factorial and Fibonacci`,code:`def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print([factorial(n) for n in range(8)])
`},{id:`numpy-basics`,title:`NumPy basics`,description:`Arrays and broadcasting`,needs:[`numpy`],code:`import numpy as np

a = np.arange(12).reshape(3, 4)
print(a)
print("column means:", a.mean(axis=0))
print("scaled:", (a - a.mean()) / a.std())
`},{id:`pandas-basics`,title:`pandas DataFrame`,description:`Group and aggregate`,needs:[`pandas`],code:`import pandas as pd

df = pd.DataFrame({
    "city": ["Oslo", "Oslo", "Rome", "Rome"],
    "temp": [3, 5, 17, 19],
})
print(df.groupby("city")["temp"].mean())
`},{id:`sine-plot`,title:`Plot a sine wave`,description:`Matplotlib, inline`,needs:[`numpy`,`matplotlib`],code:`import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 2 * np.pi, 200)
plt.plot(x, np.sin(x), label="sin")
plt.plot(x, np.cos(x), label="cos")
plt.legend()
plt.title("Waves")
plt.show()
`},{id:`sklearn-quick`,title:`Train a classifier`,description:`scikit-learn in 10 lines`,needs:[`scikit-learn`],code:`from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=0)
model = LogisticRegression(max_iter=200).fit(X_train, y_train)
print("accuracy:", round(model.score(X_test, y_test), 3))
`}],x=n();function S(e){let t=new Set(e.map(e=>e.name));if(!t.has(`untitled.py`))return`untitled.py`;for(let e=2;;e++)if(!t.has(`untitled_${e}.py`))return`untitled_${e}.py`}function C({files:e,activeId:t,onSelect:n,onAdd:r,onRename:i,onDelete:o}){let[s,c]=(0,y.useState)(null),[l,u]=(0,y.useState)(``),[d,f]=(0,y.useState)(null),p=(0,y.useRef)(null);(0,y.useEffect)(()=>{s!==null&&p.current?.select()},[s]);let m=e=>{c(e.id),u(e.name),f(null)},h=e=>{if(l===e.name)return c(null);let t=i(e.id,l.trim());t?f(t):c(null)};return(0,x.jsxs)(`div`,{className:`relative flex min-w-0 items-center`,children:[(0,x.jsx)(`div`,{role:`tablist`,"aria-label":`Files`,className:`flex min-w-0 items-center overflow-x-auto`,children:e.map(r=>{let i=r.id===t;return(0,x.jsxs)(`div`,{className:a(`group relative flex shrink-0 items-center border-b-2 font-mono text-[13px] transition-colors`,i?`border-gold text-fg`:`border-transparent text-dim hover:text-muted`),children:[s===r.id?(0,x.jsx)(`input`,{ref:p,value:l,"aria-label":`File name`,"aria-invalid":d!==null,onChange:e=>{u(e.target.value),f(null)},onBlur:()=>h(r),onKeyDown:e=>{e.key===`Enter`&&h(r),e.key===`Escape`&&c(null)},className:`mx-2 my-2 w-32 rounded border border-gold bg-surface px-1.5 py-0.5 text-fg outline-none`}):(0,x.jsx)(`button`,{type:`button`,role:`tab`,"aria-selected":i,onClick:()=>n(r.id),onDoubleClick:()=>m(r),onKeyDown:e=>e.key===`F2`&&m(r),title:`Double-click or press F2 to rename`,className:`px-3 py-3`,children:r.name}),e.length>1&&s!==r.id&&(0,x.jsx)(`button`,{type:`button`,"aria-label":`Delete ${r.name}`,onClick:()=>o(r.id),className:`mr-1.5 grid size-5 place-items-center rounded text-dim opacity-0 transition hover:bg-raised hover:text-bad focus-visible:opacity-100 group-hover:opacity-100`,children:`×`})]},r.id)})}),(0,x.jsx)(`button`,{type:`button`,"aria-label":`New file`,disabled:e.length>=20,onClick:()=>{let t=r(S(e));t&&f(t)},className:`ml-1 grid size-7 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-raised hover:text-fg disabled:opacity-40`,children:`+`}),d&&(0,x.jsx)(`p`,{role:`alert`,className:`absolute left-2 top-full z-20 mt-1 max-w-xs rounded-md border border-bad/40 bg-raised px-3 py-1.5 text-xs text-bad shadow-pop`,children:d})]})}var w=8e3;function T({onClose:e}){let[t,n]=(0,y.useState)(``),[r,i]=(0,y.useState)(!1),[a,s]=(0,y.useState)(null);return(0,x.jsxs)(`form`,{onSubmit:async e=>{e.preventDefault();let r=t.split(/[\s,]+/).filter(Boolean);if(!r.length)return;i(!0),s(null);let a=await f.install(r);s({ok:a.ok,text:a.message}),i(!1),a.ok&&n(``)},className:`w-80 p-4`,children:[(0,x.jsx)(`label`,{htmlFor:`pkg`,className:`text-sm font-medium`,children:`Install packages`}),(0,x.jsx)(`p`,{className:`mt-1 text-xs leading-relaxed text-muted`,children:`Pure-Python packages from PyPI, installed with micropip for this session. NumPy, pandas, matplotlib and scikit-learn load automatically when you import them.`}),(0,x.jsx)(`input`,{id:`pkg`,value:t,onChange:e=>n(e.target.value),placeholder:`e.g. rich, python-dateutil`,autoComplete:`off`,spellCheck:!1,className:`mt-3 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 font-mono text-[13px] outline-none focus:border-gold`}),(0,x.jsxs)(`div`,{className:`mt-3 flex items-center gap-2`,children:[(0,x.jsx)(o,{type:`submit`,variant:`primary`,size:`sm`,disabled:r||!t.trim(),children:r?`Installing…`:`Install`}),(0,x.jsx)(o,{type:`button`,variant:`ghost`,size:`sm`,onClick:e,children:`Close`})]}),a&&(0,x.jsx)(`p`,{role:`status`,className:`mt-3 text-xs ${a.ok?`text-ok`:`text-bad`}`,children:a.text})]})}function E(){let{files:e,activeId:t,stdin:n,setCode:a,setActive:S,setStdin:E,addFile:D,renameFile:O,deleteFile:k,replaceAll:A}=d(),{editorFontSize:j,keybindings:M}=i(),N=_(),P=c(e=>e.show),F=m(e=>e.status),[I,L]=r(),[R,z]=(0,y.useState)(null),B=e.find(e=>e.id===t)??e[0];(0,y.useEffect)(()=>{f.ensureReady().catch(()=>{})},[]);let V=I.get(`c`);(0,y.useEffect)(()=>{if(!V)return;let e=!1;return l(V).then(t=>{if(!e){if(L({},{replace:!0}),!t)return P(`That share link is damaged, so it could not be opened.`);d.getState().isPristine()?A(t):z(t)}}),()=>{e=!0}},[V,L,A,P]);let H=(0,y.useCallback)(()=>{if(N.running)return;let{files:e,activeId:t,stdin:n}=d.getState(),r=e.find(e=>e.id===t)??e[0];N.run(e.map(({name:e,code:t})=>({name:e,code:t})),r.name,n)},[N]),U=async()=>{let t=`${location.origin}${location.pathname}#/playground?c=${await u(e)}`;try{await navigator.clipboard.writeText(t),P(t.length>w?`Link copied — it is long, so some apps may cut it off.`:`Link copied to clipboard`)}catch{P(`Could not copy the link automatically.`)}};return(0,x.jsxs)(`div`,{className:`flex h-[calc(100dvh-4rem)] flex-col`,children:[(0,x.jsxs)(`div`,{className:`flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-1.5`,children:[(0,x.jsx)(`div`,{className:`min-w-0 flex-1`,children:(0,x.jsx)(C,{files:e,activeId:B.id,onSelect:S,onAdd:D,onRename:O,onDelete:k})}),(0,x.jsxs)(`div`,{className:`flex flex-wrap items-center gap-2`,children:[(0,x.jsx)(h,{}),(0,x.jsx)(s,{ariaLabel:`Snippets library`,label:`Snippets`,align:`right`,panelClassName:`w-72 max-h-96 overflow-auto p-1.5`,children:e=>(0,x.jsx)(`ul`,{children:b.map(t=>(0,x.jsx)(`li`,{children:(0,x.jsxs)(`button`,{type:`button`,onClick:()=>{let n=D(t.id.replace(/-/g,`_`)+`.py`,t.code);n&&P(n),e()},className:`block w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface`,children:[(0,x.jsx)(`span`,{className:`block text-sm`,children:t.title}),(0,x.jsx)(`span`,{className:`block text-xs text-dim`,children:t.description})]})},t.id))})}),(0,x.jsx)(s,{ariaLabel:`Install packages`,label:`Packages`,align:`right`,children:e=>(0,x.jsx)(T,{onClose:e})}),(0,x.jsx)(o,{size:`sm`,onClick:()=>void U(),children:`Share`}),N.running?(0,x.jsx)(o,{variant:`secondary`,size:`sm`,onClick:N.stop,className:`border-bad/60 text-bad`,children:`Stop`}):(0,x.jsxs)(o,{variant:`primary`,size:`sm`,onClick:H,disabled:F===`error`,children:[(0,x.jsx)(`svg`,{width:`10`,height:`12`,viewBox:`0 0 10 12`,"aria-hidden":!0,children:(0,x.jsx)(`path`,{d:`M1 1l8 5-8 5z`,fill:`currentColor`})}),`Run `,B.name]})]})]}),(0,x.jsxs)(`div`,{className:`grid min-h-0 flex-1 grid-rows-[3fr_2fr] lg:grid-cols-[1.15fr_1fr] lg:grid-rows-1`,children:[(0,x.jsx)(p,{docKey:String(B.id),initialValue:B.code,onChange:e=>a(B.id,e),onRun:H,fontSize:j,keybindings:M,ariaLabel:`Python code, ${B.name}`,lastError:N.lastResult?.error??null,className:`border-b border-line lg:border-b-0 lg:border-r`}),(0,x.jsx)(g,{entries:N.entries,running:N.running,prompt:N.prompt,onSubmitInput:N.submitInput,onClear:N.clear,stdin:n,onStdinChange:E})]}),(0,x.jsxs)(v,{open:R!==null,title:`Open shared code?`,confirmLabel:`Replace my files`,destructive:!0,onCancel:()=>z(null),onConfirm:()=>{R&&A(R),z(null)},children:[`This link contains `,R?.length,` file`,R?.length===1?``:`s`,`. Opening it replaces what is currently in your playground.`]})]})}export{E as default};