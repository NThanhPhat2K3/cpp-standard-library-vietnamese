---
id: chuong-05-phan-1
title: 'Chương 5 · Tiện ích và std::pair'
sidebar_label: '05 · Phần 1: std::pair'
---

# Chương 5 · Các tiện ích

> **Phạm vi:** Phần mở đầu, mục 5.1 và 5.1.1. Các phần còn lại của Chương 5 chưa nằm trên trang này.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 59–67 (PDF trang 88–96). Các hộp “Góc nhìn hiện đại” là phần bổ sung.

Chương này trình bày các tiện ích chung của thư viện chuẩn: những lớp, kiểu và hàm nhỏ thực hiện các công việc thường gặp:

- `pair<>` và `tuple<>`;
- smart pointer, gồm `shared_ptr<>` và `unique_ptr<>`;
- giới hạn số, type traits và các tiện ích kiểu;
- hàm hỗ trợ như `min()`, `max()` và `swap()`;
- `ratio<>`, đồng hồ và bộ định thời;
- một số hàm C quan trọng.

Phần lớn nhưng không phải tất cả tiện ích này thuộc phần “General Utilities” của tiêu chuẩn C++; số còn lại được mô tả cùng các thành phần khác vì thường được dùng với thành phần đó hoặc vì lý do lịch sử. Chẳng hạn, một số hàm hỗ trợ nằm trong `<algorithm>` dù không phải thuật toán STL theo nghĩa được trình bày ở Chương 6. Tác giả chọn đặt numeric limits và `ratio<>` ở đây, thay vì Chương 17 về số học, vì chúng cũng được dùng ở nhiều phần khác.

Bản thân thư viện chuẩn dùng nhiều tiện ích này: `pair<>` biểu diễn hai giá trị như một đơn vị, chẳng hạn khi hàm trả về hai giá trị hoặc phần tử container là cặp khóa–giá trị; type traits giúp xử lý các chuyển đổi kiểu phức tạp.

## 5.1 Pair và tuple

C++98 cung cấp một lớp đơn giản để quản lý cặp giá trị khác kiểu mà không cần định nghĩa lớp riêng. Nó được dùng cho kết quả gồm hai giá trị và phần tử khóa–giá trị của container.

TR1 đưa vào tuple để mở rộng ý tưởng này cho số phần tử tùy ý nhưng vẫn có giới hạn; các implementation có thể hỗ trợ di động tuple với tối đa mười phần tử khác kiểu. C++11 xây dựng lại tuple bằng variadic template, hỗ trợ một tập hợp khác kiểu với số phần tử tùy ý. `pair` vẫn tồn tại cho trường hợp hai phần tử và có thể kết hợp với tuple hai phần tử. C++11 cũng mở rộng `pair` đáng kể, thể hiện nhiều cải tiến của ngôn ngữ và thư viện.

## 5.1.1 `std::pair`

`pair` xem hai giá trị như một đơn vị. Các container `map`, `multimap`, `unordered_map` và `unordered_multimap` dùng pair để quản lý phần tử khóa–giá trị. Một ứng dụng khác là trả về hai giá trị từ một hàm, chẳng hạn `minmax()`.

`std::pair` được định nghĩa trong `<utility>`. Có thể tạo, sao chép, gán, hoán đổi và so sánh pair. `first_type` và `second_type` là các tên kiểu tương ứng với hai phần tử.

### Truy cập phần tử và các thao tác

`pair` là `struct`, với các thành viên công khai:

```cpp
namespace std {
    template <typename T1, typename T2>
    struct pair {
        T1 first;
        T2 second;
        // ...
    };
}
```

Bảng sau chuyển ngữ các thao tác trong Bảng 5.1:

| Thao tác | Tác dụng |
|:---|:---|
| `pair<T1, T2> p` | Tạo pair, khởi tạo hai phần tử theo kiểu tương ứng. |
| `pair<T1, T2> p(v1, v2)` | Tạo pair từ hai giá trị; constructor phù hợp có thể sao chép, chuyển đổi hoặc move. |
| `pair<T1, T2> p(piecewise_construct, t1, t2)` | Dùng các phần tử của từng tuple làm đối số constructor cho từng thành viên. |
| `pair<T1, T2> p(p2)` | Copy construct từ pair khác khi phù hợp. |
| `pair<T1, T2> p(std::move(p2))` | Move construct khi có overload phù hợp. |
| `p = p2` | Gán hai phần tử; từ C++11 có các overload hỗ trợ chuyển đổi phù hợp. |
| `p = std::move(p2)` | Move assignment khi phù hợp. |
| `p.first`, `p.second` | Truy cập trực tiếp phần tử thứ nhất và thứ hai. |
| `std::get<0>(p)`, `std::get<1>(p)` | Truy cập hai phần tử qua giao diện kiểu tuple từ C++11. |
| `p1 == p2`, `p1 != p2` | So sánh bằng hoặc khác theo các phần tử. |
| `p1 < p2`, `p1 > p2`, `p1 <= p2`, `p1 >= p2` | So sánh thứ tự từ điển: xét phần tử đầu rồi phần tử thứ hai khi cần. |
| `p1.swap(p2)`, `swap(p1,p2)` | Hoán đổi nội dung, từ C++11 với các overload tương ứng. |
| `std::make_pair(v1,v2)` | Tạo pair với kiểu được suy luận từ các đối số. |

*Bảng 5.1 của sách, trang 61; ký hiệu hai giá trị được viết thành `v1`, `v2` để làm rõ ý định.*

Ví dụ operator xuất pair tổng quát:

```cpp
template <typename T1, typename T2>
std::ostream& operator<<(std::ostream& strm,
                         const std::pair<T1, T2>& p) {
    return strm << "[" << p.first << "," << p.second << "]";
}
```

Đây là giải pháp có giới hạn: như chú thích của tác giả, phép tra cứu phụ thuộc đối số (*ADL*) không nhất thiết tìm thấy operator do người dùng khai báo ở mọi ngữ cảnh; xem mục 15.11.1.

Từ C++11, `pair` còn có giao diện giống tuple:

```cpp
using IntFloatPair = std::pair<int, float>;
IntFloatPair p(42, 3.14f);

std::get<0>(p);                         // p.first
std::get<1>(p);                         // p.second
std::tuple_size<IntFloatPair>::value;    // 2
std::tuple_element<0, IntFloatPair>::type value = 0; // int
```

### Constructor và phép gán

Default constructor khởi tạo hai giá trị. Với các kiểu cơ bản trong ví dụ, cả hai được khởi tạo bằng không:

```cpp
std::pair<int, float> p; // first == 0, second == 0.0f
```

Ngoài copy constructor cho cùng kiểu, constructor template cho phép chuyển đổi giữa các kiểu phần tử khi hợp lệ:

```cpp
void f(std::pair<int, const char*>);
void g(std::pair<const int, std::string>);

void foo() {
    std::pair<int, const char*> p(42, "hello");
    f(p); // cùng kiểu: copy constructor
    g(p); // constructor chuyển đổi giữa các kiểu pair
}
```

Constructor template không che khuất việc khai báo ngầm copy constructor. Sách ghi nhận thay đổi C++11 liên quan đến kiểu chỉ có copy constructor nhận tham chiếu không `const`; khi làm việc với kiểu như vậy, không nên mặc định pair đáp ứng đầy đủ các yêu cầu sao chép. Từ C++11, `pair` cũng có assignment template cho chuyển đổi phù hợp và hỗ trợ move đối với hai phần tử.

:::note Góc nhìn hiện đại
Khả năng tạo hoặc sao chép một specialization phụ thuộc overload và khả năng construct/assign của từng phần tử, cũng như phiên bản chuẩn và implementation. Ví dụ trong sách cho rằng khai báo `pair<A,int> p` tự thất bại chỉ vì `A` có `A(A&)`; điều đó không phải kết luận tổng quát nếu `A` vẫn default-constructible. Hãy kiểm tra thao tác cụ thể thay vì xem mọi `pair<A,int>` đều không hợp lệ.
:::

### Khởi tạo từng phần với `piecewise_construct`

Các constructor thông thường nhận một đối số cho `first` và một đối số cho `second`. Constructor đặc biệt nhận `std::piecewise_construct` cùng hai tuple; thay vì truyền mỗi tuple như một đối tượng nguyên vẹn, nó dùng các phần tử của tuple làm đối số cho constructor của từng thành viên.

```cpp
#include <iostream>
#include <tuple>
#include <utility>

class Foo {
public:
    Foo(std::tuple<int, float>) {
        std::cout << "Foo::Foo(tuple)\n";
    }
    template <typename... Args>
    Foo(Args... args) {
        std::cout << "Foo::Foo(args...)\n";
    }
};

int main() {
    std::tuple<int, float> t(1, 2.22f);
    std::pair<int, Foo> p1(42, t);
    std::pair<int, Foo> p2(std::piecewise_construct,
                           std::make_tuple(42), t);
}
```

Kết quả:

```text
Foo::Foo(tuple)
Foo::Foo(args...)
```

Ở `p1`, `t` được truyền nguyên vẹn cho `Foo`. Ở `p2`, các phần tử `int` và `float` của `t` được truyền riêng; constructor variadic được chọn. Nếu có constructor `Foo(int, float)` phù hợp, constructor đó sẽ được chọn. Cả hai nhóm đối số đều phải được đóng gói trong tuple, nên `42` được đưa vào `std::make_tuple(42)`. Sách nêu dạng này hữu ích khi `emplace()` phần tử vào map hoặc multimap, có thứ tự hay không có thứ tự.

### Hàm tiện ích `make_pair()`

`std::make_pair` tạo pair mà không cần viết rõ hai kiểu:

```cpp
std::pair<int, char>(42, '@');
std::make_pair(42, '@'); // suy luận kiểu từ đối số
```

Trước C++11, cách triển khai đơn giản nhận hai tham chiếu `const` và tạo pair từ chúng. Từ C++11, giao diện dùng forwarding reference và suy luận kiểu kết quả theo các đối số; nó có thể move nếu phù hợp, hoặc copy. Đối số còn trải qua phép biến đổi kiểu (*decay*), ví dụ `std::make_pair("a", "xy")` tạo pair của các con trỏ `const char*`, thay vì lưu hai kiểu mảng ký tự. Sách kỳ vọng compiler tối ưu phần overhead suy ra từ hàm tiện ích này.

Nó thuận tiện khi truyền cặp giá trị cho hàm:

```cpp
void f(std::pair<int, const char*>);
void g(std::pair<const int, std::string>);

f(std::make_pair(42, "empty"));
g(std::make_pair(42, "chair")); // chuyển đổi kiểu phần tử phù hợp
```

Từ C++11, cũng có thể dùng danh sách khởi tạo:

```cpp
f({42, "empty"});
g({42, "chair"});
```

Kiểu suy luận không phải lúc nào cũng giống kiểu ghi tường minh: `std::pair<int, float>(42, 7.77)` chứa `float`, còn `std::make_pair(42, 7.77)` suy luận phần tử thứ hai là `double`. Điều này có thể ảnh hưởng chọn overload hoặc template.

Có thể cho phép move từ đối tượng không còn cần giữ giá trị ban đầu:

```cpp
std::string s, t;
// ...
auto p = std::make_pair(std::move(s), std::move(t));
```

Để pair giữ tham chiếu thay vì bản sao, dùng `std::ref` hoặc `std::cref` từ `<functional>`:

```cpp
int i = 0;
auto p = std::make_pair(std::ref(i), std::ref(i)); // pair<int&, int&>
++p.first;
++p.second;
std::cout << "i: " << i << std::endl; // i: 2
```

Cả hai thành viên cùng tham chiếu tới `i`; đối tượng được tham chiếu phải còn sống khi pair được sử dụng.

Từ C++11, `std::tie` trong `<tuple>` có thể nhận giá trị từ pair:

```cpp
std::pair<char, char> p = std::make_pair('x', 'y');
char c;
std::tie(std::ignore, c) = p; // bỏ qua first, gán second cho c
```

Ở đây pair được gán vào một tuple có phần tử thứ hai tham chiếu đến `c`; xem mục 5.1.2.

### So sánh pair

Hai pair bằng nhau khi cả hai phần tử tương ứng bằng nhau. Với thứ tự từ điển, phần tử thứ nhất được ưu tiên; nếu chúng tương đương theo phép so sánh, mới xét phần tử thứ hai:

```cpp
// Mô hình C++11 của operator<
return x.first < y.first ||
       (!(y.first < x.first) && x.second < y.second);
```

Các toán tử thứ tự còn lại được định nghĩa tương ứng trong cách trình bày của sách. Pair được dùng rộng rãi trong các map/multimap để biểu diễn khóa–giá trị, và trong các hàm thư viện cần trả về hai giá trị.

:::note Góc nhìn hiện đại
C++17 bổ sung suy luận đối số template cho class template, cho phép những cách viết như `std::pair p{42, 7.77f}`. C++20 thay đổi cách biểu đạt nhiều phép so sánh thông qua toán tử ba chiều; hãy xét hợp đồng và kiểu phần tử trong phiên bản đang dùng. `std::move` chỉ cho phép chọn thao tác move, không tự bảo đảm một tài nguyên đã được chuyển.
:::
