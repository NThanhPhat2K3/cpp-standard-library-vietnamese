---
id: chuong-11-phan-18
title: 'Chương 11 · Merge và phép tập hợp'
sidebar_label: '11 · Phần 18: Merge và phép tập hợp'
---

# 11.10.2 · Trộn và phép tập hợp trên phạm vi đã sắp

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 614–622 (PDF trang 643–651). Hai nguồn trong các ví dụ đều được sắp theo cùng comparator.

## Số lần xuất hiện của phần tử tương đương

Với một nhóm giá trị tương đương, giả sử nó xuất hiện `m` lần trong nguồn A và `n` lần trong nguồn B:

| Thuật toán | Số lần xuất hiện trong kết quả |
|:---|:---|
| `merge` | `m + n` |
| `set_union` | `max(m,n)` |
| `set_intersection` | `min(m,n)` |
| `set_difference(A,B)` | `max(m-n,0)` |
| `set_symmetric_difference` | `|m-n|` |

Vì vậy `set_union` không nhất thiết loại hết trùng lặp; nó giữ số lượng lớn nhất giữa hai nguồn. Những hàm này nhận hai phạm vi đã sắp và một output iterator, ghi kết quả theo thứ tự và trả iterator ngay sau kết quả. Comparator, nếu có, phải phù hợp với thứ tự của **cả hai** nguồn. Đích phải đủ chỗ hoặc dùng inserter và không được chồng lấp các nguồn theo hợp đồng thuật toán.

## So sánh các kết quả

Với dữ liệu của sách:

```text
A: 1 2 2 4 6 7 7 9
B: 2 2 2 3 6 6 8 9
```

| Thuật toán | Kết quả |
|:---|:---|
| `merge` | `1 2 2 2 2 2 3 4 6 6 6 7 7 8 9 9` |
| `set_union` | `1 2 2 2 3 4 6 6 7 7 8 9` |
| `set_intersection` | `2 2 6 9` |
| `set_difference(A,B)` | `1 4 7 7` |
| `set_symmetric_difference` | `1 2 3 4 6 7 7 8` |

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <vector>

int main() {
    std::vector<int> a{1,2,2,4,6,7,7,9};
    std::vector<int> b{2,2,2,3,6,6,8,9};
    std::vector<int> unionResult, intersection;
    std::set_union(a.begin(), a.end(), b.begin(), b.end(), std::back_inserter(unionResult));
    std::set_intersection(a.begin(), a.end(), b.begin(), b.end(), std::back_inserter(intersection));
    assert((unionResult == std::vector<int>{1,2,2,2,3,4,6,6,7,7,8,9}));
    assert((intersection == std::vector<int>{2,2,6,9}));
}
```

`merge` là phép trộn ổn định: đối với phần tử tương đương, các phần tử của nguồn thứ nhất đi trước nguồn thứ hai. Sách có nhắc một số implementation cho kết quả với đầu vào chưa sắp; điều đó không làm lời gọi vi phạm tiền điều kiện trở nên portable. Nếu chỉ muốn nối hai dãy không sắp, copy từng dãy hoặc dùng phương pháp phù hợp khác.

### Khi các phần tử tương đương không hoàn toàn giống nhau

Comparator có thể chỉ xét một trường. Khi đó hai đối tượng có cùng khóa được xem là tương đương cho thuật toán, dù những trường khác khác nhau. Ví dụ dưới cho thấy `set_union` giữ các phần tử tương đương của nguồn đầu, rồi lấy phần dư từ nguồn thứ hai:

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <vector>

struct Item {
    int key;
    char label;
};
struct ByKey {
    bool operator()(const Item& a, const Item& b) const {
        return a.key < b.key;
    }
};

int main() {
    const std::vector<Item> a{{1, 'a'}, {1, 'b'}};
    const std::vector<Item> b{{1, 'c'}, {1, 'd'}, {1, 'e'}};
    std::vector<Item> result;
    std::set_union(a.begin(), a.end(), b.begin(), b.end(),
                   std::back_inserter(result), ByKey());
    assert(result.size() == 3);
    assert(result[0].label == 'a' && result[1].label == 'b');
    assert(result[2].label == 'e');
}
```

Hai nguồn đã sắp theo `ByKey`. Với khóa 1, nguồn đầu có hai phần tử và nguồn thứ hai có ba: kết quả giữ hai phần tử đầu của nguồn A và phần tử thứ ba của nguồn B. Nếu đổi comparator để xét thêm `label`, các phần tử có thể không còn tương đương và kết quả sẽ khác; cả hai nguồn cũng phải được sắp theo comparator mới trước khi gọi thuật toán.

## `inplace_merge`

`std::inplace_merge(first,middle,last[,comp])` trộn hai đoạn kề nhau `[first,middle)` và `[middle,last)` đã sắp theo cùng comparator thành một phạm vi đã sắp. Hàm yêu cầu bidirectional iterator; có thể dùng bộ nhớ phụ tùy implementation. Không nhầm với `list::merge`, hàm thành viên chuyển nút từ list khác.

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <list>

int main() {
    std::list<int> values{1,2,3,4,5,6,7,1,2,3,4,5,6,7,8};
    auto middle = std::next(values.begin(), 7);
    std::inplace_merge(values.begin(), middle, values.end());
    assert((values == std::list<int>{1,1,2,2,3,3,4,4,5,5,6,6,7,7,8}));
}
```

Ở ví dụ tổng quát, caller phải bảo đảm cả hai đoạn và iterator giữa hợp lệ trước khi gọi. Thuật toán trộn ổn định, nên thứ tự tương đối của các phần tử tương đương được giữ theo hợp đồng của nó.
