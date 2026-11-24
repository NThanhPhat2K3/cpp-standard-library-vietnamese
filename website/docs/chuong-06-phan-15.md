---
id: chuong-06-phan-15
title: 'Chương 6 · Function object có sẵn và bind'
sidebar_label: '06 · Phần 15: Function object có sẵn và bind'
---

# 6.10.2–6.10.4 · Function object có sẵn và binder

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 239–244 (PDF trang 268–273). Các hộp ghi chú là phần bổ sung.

## 6.10.2 Function object có sẵn

Header `<functional>` cung cấp nhiều function object cho các phép toán cơ bản. Ví dụ, `std::set<int>` dùng comparator mặc định tương ứng `std::less<int>`; có thể dùng `std::greater<int>` để duyệt theo thứ tự giảm dần:

```cpp
std::set<int, std::greater<int>> coll;
```

Với thuật toán, `std::negate<int>` trả giá trị đối và `std::multiplies<int>` nhân hai giá trị:

```cpp
std::deque<int> coll{1, 2, 3, 5, 7, 11, 13, 17, 19};
std::transform(coll.cbegin(), coll.cend(), coll.begin(), std::negate<int>());
// -1 -2 -3 -5 -7 -11 -13 -17 -19

std::transform(coll.cbegin(), coll.cend(), coll.cbegin(), coll.begin(),
               std::multiplies<int>());
// 1 4 9 25 49 121 169 289 361
```

Overload `transform` thứ hai kết hợp hai phạm vi nguồn rồi ghi kết quả; ở đây chúng cùng là `coll`, nên mỗi phần tử được nhân với chính nó. Như mọi phép toán số nguyên có dấu, cần tránh giá trị gây tràn.

## 6.10.3 Binder

`std::bind` trong `<functional>` tạo callable bằng cách kết hợp callable ban đầu, giá trị đã bind và các placeholder trong `std::placeholders`. `_1` biểu thị đối số đầu được truyền cho callable kết quả.

```cpp
using namespace std::placeholders;
auto timesTen = std::bind(std::multiplies<int>(), _1, 10);
std::cout << timesTen(99); // 990
```

Ví dụ sách kết hợp `bind` với các thuật toán:

```cpp
#include <algorithm>
#include <deque>
#include <functional>
#include <iterator>
#include <set>

using namespace std::placeholders;
std::set<int, std::greater<int>> src{1, 2, 3, 4, 5, 6, 7, 8, 9};
std::deque<int> dst;

std::transform(src.cbegin(), src.cend(), std::back_inserter(dst),
               std::bind(std::multiplies<int>(), _1, 10));
// 90 80 70 60 50 40 30 20 10

std::replace_if(dst.begin(), dst.end(),
                std::bind(std::equal_to<int>(), _1, 70), 42);
// 90 80 42 60 50 40 30 20 10

auto between = std::bind(std::logical_and<bool>(),
    std::bind(std::greater_equal<int>(), _1, 50),
    std::bind(std::less_equal<int>(), _1, 80));
dst.erase(std::remove_if(dst.begin(), dst.end(), between), dst.end());
// 90 42 40 30 20 10
```

Binder đầu nhân đối số với 10; binder thứ hai kiểm tra bằng 70; binder lồng cuối kiểm tra giá trị nằm trong đoạn đóng `[50,80]`. `remove_if` chỉ dồn phần tử còn lại và trả điểm cuối logic; `erase` thực sự giảm kích thước.

Không có using-directive, placeholder được viết `std::placeholders::_1`. `std::bind` cũng có thể kết hợp member function pointer với đối tượng truyền vào:

```cpp
std::for_each(coll.cbegin(), coll.cend(),
              std::bind(&Person::save, std::placeholders::_1));
```

Lời gọi yêu cầu kiểu phần tử và chữ ký `save` phù hợp; nếu iterator là const, hàm thành viên cũng phải gọi được trên đối tượng const. Mục 10.2 trình bày sâu hơn. Các adapter cũ như `bind1st`, `bind2nd`, `ptr_fun`, `mem_fun`, `mem_fun_ref` đã bị khuyến cáo không dùng từ C++11 và bị loại trong các chuẩn về sau.

:::warning Giá trị bind và đánh giá biểu thức
`std::bind` thông thường lưu bản sao/giá trị đã decay; dùng `std::ref` khi cố ý giữ tham chiếu và bảo đảm đối tượng còn sống. Không nên dựa vào thứ tự đánh giá các biểu thức bind lồng nhau để tạo side effect. `std::logical_and` là lời gọi hàm, không bảo đảm short-circuit như toán tử `&&` trong biểu thức lambda.
:::

## 6.10.4 Function object, binder và lambda

Lambda tạo một closure object và thường diễn đạt các phép biến đổi đơn giản gọn, gần nơi sử dụng:

```cpp
std::transform(src.cbegin(), src.cend(), std::back_inserter(dst),
               [](int x) { return x * 10; });
```

Functor có tên vẫn hữu ích khi hành vi được dùng ở nhiều nơi, có invariant riêng hoặc cần một kiểu cụ thể cho comparator. Sách xem việc đóng gói trạng thái và khả năng tái sử dụng là điểm mạnh của functor; nhận định rằng lambda không thể giữ trạng thái nội bộ cần được hiểu lại: lambda có thể capture theo giá trị và dùng `mutable` để thay đổi bản sao của mình qua các lời gọi. Dù dùng cách nào, hãy xét việc thuật toán có thể sao chép callable.
