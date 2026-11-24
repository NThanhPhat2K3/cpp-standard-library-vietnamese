---
id: chuong-06-phan-10
title: 'Chương 6 · Stream, reverse và move iterator'
sidebar_label: '06 · Phần 10: Stream, reverse, move iterator'
---

# 6.5.2–6.5.4 · Các iterator adapter

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 212–216 (PDF trang 241–245). Các hộp ghi chú là phần bổ sung.

## 6.5.2 Stream iterator

Stream iterator biểu diễn đầu vào hoặc đầu ra của stream như một nguồn hoặc đích cho thuật toán. Ví dụ sách đọc các từ từ standard input, sắp xếp rồi in mỗi từ một lần:

```cpp
#include <algorithm>
#include <iostream>
#include <iterator>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> coll;
    std::copy(std::istream_iterator<std::string>(std::cin),
              std::istream_iterator<std::string>(),
              std::back_inserter(coll));
    std::sort(coll.begin(), coll.end());
    std::unique_copy(coll.cbegin(), coll.cend(),
                     std::ostream_iterator<std::string>(std::cout, "\n"));
}
```

- `istream_iterator<std::string>(std::cin)` đọc bằng `operator>>`; với string, mặc định nó đọc từng từ phân tách bởi whitespace.
- `istream_iterator<std::string>()` là end-of-stream iterator. Khi không thể đọc tiếp do hết dữ liệu hoặc lỗi, phạm vi kết thúc.
- `back_inserter(coll)` thêm các từ đọc được vào vector.
- `sort` đặt các từ theo thứ tự; `unique_copy` chỉ bỏ các phần tử **trùng liên tiếp**. Nhờ đã sắp xếp, các từ bằng nhau nằm cạnh nhau trong ví dụ này.
- `ostream_iterator<std::string>(std::cout, "\n")` ghi mỗi phần tử bằng `operator<<` và thêm dấu phân cách sau mỗi phần tử.

Các thành phần là template, nên có thể điều chỉnh kiểu dữ liệu nếu phép đọc, ghi và so sánh tương ứng hợp lệ. Mục 9.4.3 có thêm ví dụ. Một stream biểu diễn kênh I/O; sách trình bày sâu hơn ở Chương 15.

:::note Input iterator
Stream iterator là input iterator: không nên giả định có thể duyệt lại dữ liệu đã đọc như với vector. Kết thúc đọc cũng có thể do lỗi, không chỉ do EOF; nếu cần phân biệt, kiểm tra trạng thái stream sau đó.
:::

## 6.5.3 Reverse iterator

Reverse iterator cho phép thuật toán duyệt theo chiều ngược bằng cách ánh xạ bước tiến của reverse iterator sang bước lùi của iterator nền. Container có iterator hai chiều hoặc random access thường cung cấp `rbegin()` và `rend()`; từ C++11 còn có `crbegin()` và `crend()` cho truy cập const. `forward_list` và unordered container không cung cấp các member reverse đó theo giao diện C++11.

```cpp
#include <algorithm>
#include <iostream>
#include <iterator>
#include <vector>

int main() {
    std::vector<int> coll;
    for (int i = 1; i <= 9; ++i) coll.push_back(i);
    std::copy(coll.crbegin(), coll.crend(),
              std::ostream_iterator<int>(std::cout, " "));
    std::cout << '\n';
}
```

Kết quả: `9 8 7 6 5 4 3 2 1`. Với container không rỗng, `*crbegin()` truy cập phần tử cuối; `crend()` là điểm kết thúc của phạm vi duyệt ngược, **không được giải tham chiếu**. Reverse iterator làm thuật toán như `copy` hoạt động theo chiều ngược mà không cần viết thuật toán mới.

:::note Quan hệ với iterator nền
`reverse_iterator::base()` chỉ tới vị trí ngay **sau** phần tử mà reverse iterator hiện hành biểu diễn. Không giả định dereference của reverse iterator và `base()` cho cùng phần tử. Mục 9.4.1 của sách giải thích sâu hơn.
:::

## 6.5.4 Move iterator

Move iterator, từ C++11, điều chỉnh cách dereference iterator nền để cho phép các thuật toán hoặc constructor nhận phần tử dưới dạng phù hợp với move semantics:

```cpp
#include <algorithm>
#include <iterator>
#include <string>
#include <vector>

std::vector<std::string> src{"alpha", "beta"};
std::vector<std::string> dst;
std::copy(std::make_move_iterator(src.begin()),
          std::make_move_iterator(src.end()),
          std::back_inserter(dst));
```

Nếu phép khởi tạo/gán đích chọn move operation, các chuỗi được chuyển vào `dst`. `src` vẫn có hai phần tử, nhưng trạng thái của từng chuỗi đã move là hợp lệ nhưng không được giả định nội dung cụ thể. Move iterator không tự di chuyển dữ liệu: hiệu quả cuối cùng phụ thuộc phép toán được chọn, tính `const` và kiểu phần tử. Sách bàn thêm ở mục 9.4.4.
