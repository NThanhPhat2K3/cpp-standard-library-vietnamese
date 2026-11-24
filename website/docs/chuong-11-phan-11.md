---
id: chuong-11-phan-11
title: 'Chương 11 · Fill, generate, iota và replace'
sidebar_label: '11 · Phần 11: Fill, generate và replace'
---

# 11.6.5–11.6.6 · Gán và thay thế giá trị

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 568–574 (PDF trang 597–603). Các ví dụ giữ dữ liệu của sách và tự include header.

## `fill` và `fill_n`

`std::fill(first,last,value)` gán cùng giá trị cho từng phần tử trong phạm vi. `std::fill_n(out,n,value)` ghi `n` giá trị bắt đầu ở output iterator và trả iterator sau phần đã ghi; với `n <= 0`, không ghi. Đích phải đủ chỗ hoặc dùng inserter/stream iterator phù hợp.

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <list>
#include <string>

int main() {
    std::list<std::string> values;
    std::fill_n(std::back_inserter(values), 9, "hello");
    std::fill(values.begin(), values.end(), "again");
    std::fill_n(values.begin(), values.size() - 2, "hi");
    std::fill(std::next(values.begin()), std::prev(values.end()), "hmmm");
    assert((values == std::list<std::string>{"hi","hmmm","hmmm","hmmm","hmmm",
                                             "hmmm","hmmm","hmmm","again"}));
}
```

Ở ví dụ này list chắc chắn có chín phần tử. Với dữ liệu tùy ý, phải kiểm tra kích thước trước `size()-2` vì `size_type` không dấu, và trước `next(begin())`/`prev(end())`. Sách còn dùng `fill_n` với `ostream_iterator<float>` để in `7.7` mười lần.

## `generate`, `generate_n`, `iota`

`generate(first,last,gen)` gọi generator không đối số rồi gán kết quả cho từng phần tử. `generate_n(out,n,gen)` ghi `n` kết quả và trả iterator sau phần đã ghi từ C++11; `n <= 0` không ghi. Generator có thể được sao chép: nếu cần chia sẻ trạng thái, dùng thiết kế phù hợp như `std::ref` và bảo đảm vòng đời.

Sách minh họa `std::rand`; dãy số và chất lượng phụ thuộc implementation, nên không cố định output. Với bài toán ngẫu nhiên thực tế, chương 17 trình bày thêm các engine và distribution.

`std::iota` trong `<numeric>` gán giá trị bắt đầu rồi tăng dần bằng phép `++`:

```cpp
#include <algorithm>
#include <array>
#include <cassert>
#include <iterator>
#include <numeric>
#include <vector>

int main() {
    std::array<int,10> values{};
    std::iota(values.begin(), values.end(), 42);
    assert(values.front() == 42 && values.back() == 51);
    std::vector<int> generated;
    int next = 0;
    std::generate_n(std::back_inserter(generated), 3, [&next] { return ++next; });
    assert((generated == std::vector<int>{1,2,3}));
}
```

Cần bảo đảm phép tăng và phép gán hợp lệ với kiểu giá trị; không để số nguyên có dấu tràn.

## `replace` và `replace_if`

`replace(first,last,oldValue,newValue)` gán `newValue` tại các vị trí bằng `oldValue`; `replace_if` dùng unary predicate. Cả hai thay đổi phạm vi tại chỗ và có độ phức tạp tuyến tính. Predicate không được sửa phần tử được truyền vào theo hợp đồng thuật toán.

```cpp
#include <algorithm>
#include <cassert>
#include <list>

int main() {
    std::list<int> values{2,3,4,5,6,7,4,5,6,7,8,9};
    std::replace(values.begin(), values.end(), 6, 42);
    std::replace_if(values.begin(), values.end(), [](int x) { return x < 5; }, 0);
    assert((values == std::list<int>{0,0,0,5,42,7,0,5,42,7,8,9}));
}
```

## `replace_copy` và `replace_copy_if`

Hai biến thể này đọc nguồn và ghi **toàn bộ** kết quả sang đích: phần tử phù hợp được thay, các phần tử khác được copy. Chúng trả iterator ngay sau phần đã ghi; đích phải đủ chỗ hoặc dùng inserter. Nguồn và đích phải đáp ứng điều kiện overlap của thuật toán.

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <vector>

int main() {
    std::vector<int> source{2,3,4,5,6,4,5,6,7,8,9};
    std::vector<int> out;
    std::replace_copy_if(source.cbegin(), source.cend(), std::back_inserter(out),
                         [](int x) { return x % 2 != 0; }, 0);
    assert((out == std::vector<int>{2,0,4,0,6,4,0,6,0,8,0}));
    assert(source[1] == 3); // nguồn không bị thay đổi
}
```

Với cùng dãy nguồn, sách còn minh họa thay 5 bằng 55 khi in và thay các giá trị nhỏ hơn 5 bằng 42. Nếu `oldValue` hoặc `newValue` tham chiếu trực tiếp vào vùng đang bị sửa, cần cẩn thận với aliasing; lưu bản sao giá trị trước nếu cần giá trị cố định trong suốt thuật toán.
