---
id: chuong-09-phan-2
title: 'Chương 9 · Hàm hỗ trợ iterator'
sidebar_label: '09 · Phần 2: Advance, next, distance'
---

# 9.3 · Hàm hỗ trợ iterator

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 441–447 (PDF trang 470–476). Các ví dụ được trình bày lại để chạy độc lập.

Các hàm `advance`, `next`, `prev`, `distance` trong `<iterator>` hỗ trợ di chuyển hoặc tính khoảng cách mà không cần tự viết vòng lặp. `iter_swap` trong `<algorithm>` hoán đổi giá trị tại hai iterator. Chúng không biết biên container và không tự ngăn truy cập sai phạm vi.

## 9.3.1 `std::advance`

`std::advance(it, n)` thay đổi trực tiếp `it` và trả `void`. Với iterator bidirectional hoặc random access, `n` có thể âm để đi lùi. Với iterator chỉ đi tiến, không dùng số bước âm. Caller phải bảo đảm mọi bước đều hợp lệ: không tăng `end()` hoặc giảm trước `begin()`.

Random-access iterator thường dùng số học iterator với độ phức tạp hằng số; với iterator khác, hàm thực hiện số bước tuyến tính theo độ lớn `n`. Đổi container mà giữ nguyên lời gọi có thể thay đổi đáng kể hiệu năng.

```cpp
#include <iostream>
#include <iterator>
#include <list>

int main() {
    std::list<int> values{1, 2, 3, 4, 5, 6, 7, 8, 9};
    auto pos = values.begin();
    std::cout << *pos << '\n';
    std::advance(pos, 3);
    std::cout << *pos << '\n';
    std::advance(pos, -1);
    std::cout << *pos << '\n';
}
```

Output: `1`, `4`, `3`, mỗi số một dòng. Sách cũng đề cập dùng `advance` để bỏ qua một số phần tử đầu vào; với input iterator một lượt, thao tác đó có thể tiêu thụ dữ liệu nguồn.

## 9.3.2 `std::next` và `std::prev`

`std::next(it, n)` trả một iterator mới sau khi tiến `n` bước; mặc định `n` là 1. `std::prev(it, n)` trả iterator lùi `n` bước và yêu cầu khả năng đi lùi. Cả hai nhận iterator theo giá trị và không sửa biến iterator được truyền vào. Với bidirectional iterator, độ lệch âm đảo hướng di chuyển.

```cpp
auto pos = values.begin();
while (pos != values.end() && std::next(pos) != values.end()) {
    // *pos và *std::next(pos) là hai phần tử liền nhau
    ++pos;
}
```

Điều kiện đầu tiên bảo đảm không gọi `next(end())`; vòng lặp chỉ đọc cặp phần tử khi phần tử tiếp theo tồn tại. `std::next` hữu ích với forward/bidirectional iterator không có `operator+`, và tránh `++container.begin()` có thể không biên dịch nếu iterator là raw pointer. `prev(end())` chỉ hợp lệ khi dãy có phần tử. Cả hai hàm có từ C++11.

## 9.3.3 `std::distance`

`std::distance(first,last)` trả số bước từ `first` tới `last`, với kiểu `iterator_traits<It>::difference_type`. Với iterator không random access, `last` phải đạt được bằng cách tăng `first`; thời gian tuyến tính. Với random-access iterator trong cùng phạm vi hợp lệ, phép trừ có độ phức tạp hằng số và kết quả có thể âm nếu thứ tự ngược.

```cpp
#include <algorithm>
#include <iostream>
#include <iterator>
#include <list>

int main() {
    std::list<int> values{-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    auto pos = std::find(values.begin(), values.end(), 5);
    if (pos != values.end())
        std::cout << "distance: " << std::distance(values.begin(), pos) << '\n';
}
```

Kết quả là `distance: 8`. Với input iterator một lượt, tính distance có thể tiêu thụ nguồn mà các bản sao cùng chia sẻ; không giả định sau đó có thể đọc lại dãy từ đầu. Nếu không biết thứ tự của hai bidirectional iterator, cần có cách xác định vị trí hợp lệ từ một mốc chung; không gọi `distance` theo chiều mà `last` không reachable từ `first`.

## 9.3.4 `std::iter_swap`

`std::iter_swap(a,b)` hoán đổi các giá trị được trỏ tới, không hoán đổi chính hai biến iterator. Chúng có thể có kiểu iterator khác nhau nếu các giá trị tham chiếu đáp ứng yêu cầu hoán đổi; cả hai phải dereference hợp lệ và cho phép thao tác đó.

```cpp
#include <algorithm>
#include <iostream>
#include <iterator>
#include <list>

void print(const std::list<int>& values) {
    for (int value : values) std::cout << value << ' ';
    std::cout << '\n';
}
int main() {
    std::list<int> values{1, 2, 3, 4, 5, 6, 7, 8, 9};
    print(values);
    std::iter_swap(values.begin(), std::next(values.begin()));
    print(values);
    std::iter_swap(values.begin(), std::prev(values.end()));
    print(values);
}
```

Các dòng lần lượt là `1 2 3 4 5 6 7 8 9`, `2 1 3 4 5 6 7 8 9` và `9 1 3 4 5 6 7 8 2`. Ví dụ có ít nhất hai phần tử; với đầu vào tổng quát phải kiểm tra trước khi gọi `next(begin())` để dereference hoặc `prev(end())`.
