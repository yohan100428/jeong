> **DEMO 문서** — 화면 렌더링 검증용 샘플입니다. 실제 연구 결과가 아닙니다.

## 1. Introduction

이 문서는 연구자료 본문에서 지원하는 Markdown 요소(제목, 인용문, 표, 수식, 코드, 링크)를 확인하기 위한 예시입니다.

## 2. Research Objectives

- 조향 기하 설계 항목 정리
- 검토 기준 수립

## 3. Methodology

애커만(Ackermann) 조건은 내측·외측 바퀴 조향각 $\delta_i$, $\delta_o$, 윤거 $w$, 축거 $L$ 에 대해 다음과 같이 쓴다.

$$
\cot\delta_o - \cot\delta_i = \frac{w}{L}
$$

### 3.1 검토 항목

| 항목 | 기호 | 단위 |
|---|---|---|
| 축거 | $L$ | mm |
| 윤거 | $w$ | mm |
| 내측 조향각 | $\delta_i$ | deg |

## 4. Results

(작성 예정)

## 5. Code Example

```python
import math

def ackermann_outer(delta_i_deg, w, L):
    di = math.radians(delta_i_deg)
    return math.degrees(math.atan(1 / (1 / math.tan(di) + w / L)))
```

## 6. References

- 관련 문서 링크 예시: [연구자료 목록](index.html)
