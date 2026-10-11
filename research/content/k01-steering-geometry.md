> **DEMO document** — a sample for checking how content renders. Not real research results.

## 1. Introduction

This document is an example for checking the Markdown elements supported in research content: headings, quotes, tables, formulas, code and links.

## 2. Research Objectives

- List the steering geometry design items
- Define the review criteria

## 3. Methodology

The Ackermann condition for the inner and outer wheel steering angles $\delta_i$, $\delta_o$, track width $w$ and wheelbase $L$ is written as follows.

$$
\cot\delta_o - \cot\delta_i = \frac{w}{L}
$$

### 3.1 Review Items

| Item | Symbol | Unit |
|---|---|---|
| Wheelbase | $L$ | mm |
| Track width | $w$ | mm |
| Inner steering angle | $\delta_i$ | deg |

## 4. Results

(To be written)

## 5. Code Example

```python
import math

def ackermann_outer(delta_i_deg, w, L):
    di = math.radians(delta_i_deg)
    return math.degrees(math.atan(1 / (1 / math.tan(di) + w / L)))
```

## 6. References

- Example of a related document link: [Research Library](index.html)
