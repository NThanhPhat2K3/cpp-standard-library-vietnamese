---
id: chuong-05-phan-2
title: 'Chương 5 · std::tuple, I/O và chuyển đổi'
sidebar_label: '05 · Phần 2: std::tuple'
---

# 5.1.2–5.1.4 · `std::tuple`

> **Phạm vi:** Các mục 5.1.2–5.1.4. Chương 5 vẫn đang được dịch.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 68–75 (PDF trang 97–104). Các hộp “Góc nhìn hiện đại” là phần bổ sung.

## 5.1.2 Tuple

Tuple xuất hiện trong TR1 để mở rộng ý tưởng pair thành một danh sách phần tử có thể khác kiểu; các kiểu được chỉ định hoặc suy luận khi biên dịch. Vì TR1 dựa trên tính năng ngôn ngữ C++98, chưa có variadic template, implementation phải định nghĩa một số lượng tham số tối đa. TR1 khuyến nghị hỗ trợ ít nhất mười đối số; những vị trí không dùng được biểu diễn bằng kiểu mặc định riêng của implementation. Đây là cách mô phỏng variadic template khá cồng kềnh và có giới hạn.

C++11 giới thiệu variadic template, nên `tuple` trong `<tuple>` có thể khai báo theo ý tưởng:

```cpp
namespace std {
    template <typename... Types>
    class tuple;
}
```

### Tạo và truy cập tuple

Có thể khai báo kiểu tường minh hoặc dùng `std::make_tuple()` để suy luận; truy cập phần tử bằng `std::get<index>()`:

```cpp
#include <complex>
#include <iostream>
#include <string>
#include <tuple>

int main() {
    std::tuple<std::string, int, int, std::complex<double>> t;
    std::tuple<int, float, std::string> t1(41, 6.3f, "nico");

    std::cout << std::get<0>(t1) << ' '
              << std::get<1>(t1) << ' '
              << std::get<2>(t1) << '\n';

    auto t2 = std::make_tuple(22, 44, "nico");
    std::get<1>(t1) = std::get<1>(t2);
    if (t1 < t2) {
        t1 = t2; // gán từng phần tử với các chuyển đổi phù hợp
    }
}
```

`t` có bốn phần tử và được khởi tạo mặc định; trong ví dụ này các số cơ bản được khởi tạo bằng không. `t1` có ba phần tử khác kiểu. `make_tuple(22, 44, "nico")` tạo `tuple<int, int, const char*>`: literal `"nico"` vốn là mảng `const char[5]` và được decay thành con trỏ.

Một phần tử tuple cũng có thể là tham chiếu:

```cpp
std::string s;
std::tuple<std::string&> t(s);
std::get<0>(t) = "hello"; // gán cho s
```

Tuple không phải container thông thường có thể duyệt mọi phần tử bằng iterator. Với `get<index>`, chỉ số phải biết khi biên dịch; một chỉ số ngoài phạm vi cũng gây lỗi biên dịch:

```cpp
int i = 1;
std::get<i>(t1); // LỖI: i không phải hằng biểu thức
std::get<3>(t1); // LỖI: t1 chỉ có các chỉ số 0, 1, 2
```

Tuple hỗ trợ copy, gán và so sánh khi các thao tác trên phần tử tương ứng hợp lệ; việc chuyển đổi kiểu có thể được hỗ trợ và số phần tử phải phù hợp. Bằng nhau nghĩa là các phần tử tương ứng bằng nhau; so sánh thứ tự dùng thứ tự từ điển.

### Bảng thao tác

| Thao tác | Tác dụng |
|:---|:---|
| `tuple<T1,...,Tn> t` | Tạo tuple và khởi tạo các phần tử. |
| `tuple<T1,...,Tn> t(v1,...,vn)` | Tạo tuple từ các giá trị tương ứng. |
| `tuple<T1,T2> t(p)` | Tạo tuple hai phần tử từ pair khi kiểu tương thích. |
| `t = t2`, `t = p` | Gán từ tuple hoặc pair phù hợp. |
| `t1 == t2`, `t1 != t2` | So sánh bằng hoặc khác theo phần tử. |
| `t1 < t2`, `>`, `<=`, `>=` | So sánh thứ tự từ điển. |
| `t1.swap(t2)`, `swap(t1,t2)` | Hoán đổi các phần tử. |
| `make_tuple(v1, v2, ...)` | Tạo tuple với các kiểu suy luận từ giá trị. |
| `tie(ref1, ref2, ...)` | Tạo tuple chứa tham chiếu, thuận tiện để nhận giá trị. |

*Bảng 5.2 của sách, trang 71.*

### `make_tuple()`, `ref()` và `tie()`

`make_tuple()` thông thường tạo phần tử theo giá trị. Dùng `std::ref` hoặc `std::cref` trong `<functional>` nếu muốn phần tử kết quả tham chiếu đến đối tượng đã có:

```cpp
std::string s;
auto x = std::make_tuple(s);           // tuple<string>
std::get<0>(x) = "my value";           // sửa bản sao, không sửa s

auto y = std::make_tuple(std::ref(s)); // tuple<string&>
std::get<0>(y) = "my value";           // sửa s
```

Có thể tạo tuple tham chiếu rồi gán từ tuple khác để trích xuất các phần tử:

```cpp
std::tuple<int, float, std::string> t(77, 1.1f, "more light");
int i;
float f;
std::string s;
std::make_tuple(std::ref(i), std::ref(f), std::ref(s)) = t;
```

`std::tie()` ngắn gọn hơn cho mục đích này. Dùng `std::ignore` để bỏ qua một phần tử:

```cpp
std::tie(i, f, s) = t;            // gán cả ba giá trị
std::tie(i, std::ignore, s) = t; // chỉ nhận phần tử đầu và cuối
```

:::note Góc nhìn hiện đại
Tuple chứa tham chiếu không sở hữu đối tượng được tham chiếu; đối tượng đó phải còn sống khi truy cập tuple. Từ C++17, structured binding giúp khai báo tên cho các phần tử, nhưng `tie` vẫn hữu ích khi gán vào các biến đã tồn tại.
:::

### Tuple và danh sách khởi tạo

Sách trình bày các constructor nhận nhiều đối số của tuple như `explicit`, nhằm tránh tự chuyển một giá trị thành tuple một phần tử:

```cpp
template <typename... Args>
void foo(const std::tuple<Args...> t);

foo(42);                  // không suy luận thành tuple từ int
foo(std::make_tuple(42)); // hợp lệ
```

Theo cách trình bày ban đầu của sách, khởi tạo trực tiếp bằng ngoặc tròn hoặc ngoặc nhọn được chấp nhận, trong khi copy-list-initialization và việc truyền danh sách ngầm bị từ chối do constructor `explicit`:

```cpp
std::tuple<int, double> t1(42, 3.14);
std::tuple<int, double> t2{42, 3.14};
// Sách C++11 ban đầu nêu dạng sau là lỗi:
std::tuple<int, double> t3 = {42, 3.14};
```

Sách cũng nêu các ví dụ danh sách lồng trong `vector<tuple<int,float>>` và `return {1, 2, 3}` cho hàm trả tuple, đối lập với `pair` hoặc `vector`; giải pháp tường minh được đưa ra là `make_tuple`:

```cpp
std::vector<std::tuple<int, float>> v{
    std::make_tuple(1, 1.0f), std::make_tuple(2, 2.0f)
};
std::tuple<int, int, int> makeValues() {
    return std::make_tuple(1, 2, 3);
}
```

:::note Góc nhìn hiện đại
Các constructor của `tuple` đã được điều chỉnh thông qua các sửa lỗi và chuẩn sau: tính `explicit` có thể phụ thuộc khả năng chuyển đổi của từng phần tử. Vì thế những dạng sách đánh dấu lỗi không phải lúc nào cũng lỗi trên thư viện hiện nay. Ví dụ `foo(42)` ở trên còn thất bại vì không thể suy luận parameter pack từ `int`; đừng dùng nó làm bằng chứng duy nhất về `explicit`. Kiểm tra đúng chuẩn và implementation mục tiêu.
:::

### Các tiện ích bổ sung

`std::tuple_size<T>::value` cho số phần tử; `std::tuple_element<I,T>::type` cho kiểu phần tử thứ `I`; `std::tuple_cat()` nối các tuple:

```cpp
using TupleType = std::tuple<int, float, std::string>;
// std::tuple_size<TupleType>::value == 3
using Second = std::tuple_element<1, TupleType>::type; // float

int n = 0;
auto tt = std::tuple_cat(std::make_tuple(42, 7.7, "hello"),
                         std::tie(n));
```

`tt` chứa các phần tử của cả hai tuple; phần tử cuối vẫn là tham chiếu đến `n`. Một số kiểu khác, gồm `pair`, cũng có giao diện kiểu tuple và có thể tham gia `tuple_cat` trong những trường hợp được hỗ trợ. `tuple_element` mô tả kiểu phần tử; kiểu biểu thức `get` còn phụ thuộc vào tham chiếu và tính `const` của tuple được truyền.

## 5.1.3 Nhập/xuất tuple

Tuple từng có giao diện xuất stream trong Boost, nhưng thư viện chuẩn C++ được sách mô tả không cung cấp operator xuất tuple tương ứng. Ví dụ sau dùng template đệ quy ở thời điểm biên dịch để in từng phần tử; mỗi phần tử phải tự hỗ trợ `operator<<`:

```cpp
#include <iostream>
#include <tuple>

template <int IDX, int MAX, typename... Args>
struct PRINT_TUPLE {
    static void print(std::ostream& strm, const std::tuple<Args...>& t) {
        strm << std::get<IDX>(t) << (IDX + 1 == MAX ? "" : ",");
        PRINT_TUPLE<IDX + 1, MAX, Args...>::print(strm, t);
    }
};

template <int MAX, typename... Args>
struct PRINT_TUPLE<MAX, MAX, Args...> {
    static void print(std::ostream&, const std::tuple<Args...>&) {}
};

template <typename... Args>
std::ostream& operator<<(std::ostream& strm, const std::tuple<Args...>& t) {
    strm << "[";
    PRINT_TUPLE<0, sizeof...(Args), Args...>::print(strm, t);
    return strm << "]";
}
```

Mỗi lần gọi `print` xuất một phần tử rồi gọi specialization cho chỉ số kế tiếp. Partial specialization có `IDX == MAX` kết thúc đệ quy. Ví dụ:

```cpp
std::tuple<int, float, std::string> t(77, 1.1f, "more light");
std::cout << "io: " << t << std::endl;
```

Kết quả minh họa trong sách là `io: [77,1.1,more light]`; lời gọi bắt đầu tại `PRINT_TUPLE<0, 3, Args...>::print`. Như tác giả lưu ý, operator này có giới hạn về tra cứu tên và ADL, nên không nhất thiết được tìm thấy trong mọi ngữ cảnh.

## 5.1.4 Chuyển đổi giữa tuple và pair

Có thể khởi tạo hoặc gán một tuple hai phần tử từ pair khi các kiểu tương ứng phù hợp. Ngược lại, `pair` có constructor `piecewise_construct` dùng các tuple làm nhóm đối số để khởi tạo từng thành viên; xem mục 5.1.1. Ngoài tuple, các kiểu như `pair` và `array` cũng cung cấp một phần giao diện kiểu tuple.
