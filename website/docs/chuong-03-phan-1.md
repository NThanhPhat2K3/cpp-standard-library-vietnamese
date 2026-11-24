---
id: chuong-03-phan-1
title: 'Chương 3 · Các tính năng ngôn ngữ (phần 1)'
sidebar_label: '03 · Phần 1: Tính năng ngôn ngữ'
---

# Chương 3 · Các tính năng ngôn ngữ

> **Phạm vi:** Phần mở đầu và mục 3.1.1–3.1.4. Các mục còn lại chưa được dịch trên trang này.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 13–19 (PDF trang 42–48). Các hộp “Góc nhìn hiện đại” là phần bổ sung.

Ngôn ngữ cốt lõi và thư viện C++ thường được chuẩn hóa song song. Thư viện nhờ đó tận dụng các cải tiến của ngôn ngữ, còn ngôn ngữ hưởng lợi từ kinh nghiệm triển khai thư viện. Vì vậy, thư viện chuẩn của một phiên bản C++ có thể sử dụng các tính năng không có ở phiên bản trước.

C++11 khác C++98/C++03, cũng như C++98/C++03 khác C++ trước khi được chuẩn hóa. Nếu không theo dõi sự phát triển ấy, bạn có thể bất ngờ bởi các tính năng ngôn ngữ mà thư viện sử dụng. Chương này giới thiệu ngắn gọn các tính năng C++11 quan trọng đối với thiết kế, việc hiểu và sử dụng thư viện chuẩn C++11; cuối chương trình bày một số tính năng có từ trước C++11 nhưng vẫn chưa được biết đến rộng rãi.

Khi tác giả viết sách vào năm 2010–2011, không phải trình biên dịch nào cũng hỗ trợ đầy đủ các tính năng mới. Tác giả kỳ vọng tình hình sớm thay đổi vì các nhà cung cấp trình biên dịch lớn đều tham gia quá trình chuẩn hóa. Tuy nhiên, trong một thời gian, việc dùng thư viện có thể bị hạn chế; tác giả ghi chú trong sách những giới hạn tiêu biểu và quan trọng.

## 3.1 Các tính năng ngôn ngữ mới trong C++11

### 3.1.1 Những thay đổi cú pháp nhỏ nhưng quan trọng

#### Khoảng trắng giữa các dấu đóng template

C++11 bỏ yêu cầu phải đặt khoảng trắng giữa hai dấu đóng template lồng nhau:

```cpp
std::vector<std::list<int> > a; // hợp lệ trong các phiên bản C++
std::vector<std::list<int>> b;  // hợp lệ từ C++11
```

Trong sách và trong mã thực tế, bạn có thể gặp cả hai dạng.

#### `nullptr` và `std::nullptr_t`

C++11 cho phép dùng `nullptr` thay cho `0` hoặc `NULL` để biểu thị con trỏ null; điều này khác với một con trỏ có giá trị chưa xác định. Tính năng này đặc biệt giúp tránh việc giá trị null bị hiểu thành một số nguyên khi chọn hàm nạp chồng:

```cpp
void f(int);
void f(void*);

f(0);       // gọi f(int)
f(NULL);    // gọi f(int) nếu NULL là 0; định nghĩa khác có thể gây mơ hồ
f(nullptr); // gọi f(void*)
```

`nullptr` là từ khóa mới, có thể chuyển đổi ngầm sang các kiểu con trỏ nhưng không chuyển đổi ngầm sang kiểu số nguyên. Nó có kiểu `std::nullptr_t`, định nghĩa trong `<cstddef>`, nên ta có thể nạp chồng riêng cho trường hợp truyền giá trị null. `std::nullptr_t` là một kiểu dữ liệu cơ bản. Sách nói thêm về nó ở mục 5.4.2 và 5.8.1.

### 3.1.2 Suy luận kiểu tự động với `auto`

C++11 cho phép khai báo biến mà không ghi kiểu cụ thể bằng `auto`:

```cpp
auto i = 42;  // kiểu int

double f();
auto d = f(); // kiểu double
```

Kiểu được suy luận từ biểu thức khởi tạo, vì thế cần phải khởi tạo:

```cpp
auto i; // LỖI: không thể suy luận kiểu
static auto vat = 0.19; // có thể kết hợp với static
```

`auto` hữu ích khi kiểu dài hoặc phức tạp:

```cpp
std::vector<std::string> v;
auto pos = v.begin(); // std::vector<std::string>::iterator

auto predicate = [](int x) -> bool {
    return x > 0;
}; // đối tượng có kiểu closure của lambda
```

Lambda được giới thiệu ở mục 3.1.10; ví dụ trên được viết đầy đủ để dễ đọc. Chú thích trong sách nhắc rằng `auto` vốn là từ khóa cũ của C, dùng chỉ thời hạn lưu trữ tự động cho biến cục bộ, đối lập với `static`; người ta hiếm khi viết nó vì biến cục bộ thông thường vốn mặc định như vậy.

:::note Góc nhìn hiện đại
`auto` vẫn suy luận một kiểu tĩnh tại thời điểm biên dịch. `auto`, `auto&` và `const auto&` có thể khác nhau về sao chép, tham chiếu và khả năng sửa đối tượng.
:::

### 3.1.3 Khởi tạo bằng ngoặc nhọn và danh sách khởi tạo

Trước C++11, lập trình viên, nhất là người mới, có thể nhầm lẫn giữa khởi tạo bằng ngoặc tròn, ngoặc nhọn và dấu gán. C++11 giới thiệu cú pháp dùng ngoặc nhọn được áp dụng rộng rãi:

```cpp
int values[]{1, 2, 3};
std::vector<int> v{2, 3, 5, 7, 11, 13, 17};
std::vector<std::string> cities{
    "Berlin", "New York", "London", "Braunschweig", "Cairo", "Cologne"
};
std::complex<double> c{4.0, 3.0}; // tương đương c(4.0, 3.0)
```

Trong các ví dụ kiểu cơ bản sau, ngoặc rỗng tạo giá trị bằng không hoặc con trỏ null; biến cục bộ không khởi tạo có giá trị chưa xác định:

```cpp
int i;    // chưa xác định
int j{};  // 0
int* p;   // chưa xác định
int* q{}; // nullptr
```

Ngoặc nhọn không cho phép các chuyển đổi **thu hẹp** (*narrowing*) theo quy tắc ngôn ngữ:

```cpp
int x1(5.3);       // hợp lệ, nhưng thành 5
int x2 = 5.3;      // hợp lệ, nhưng thành 5
int x3{5.0};       // LỖI: thu hẹp
int x4 = {5.3};    // LỖI: thu hẹp
char c1{7};        // hợp lệ nếu char biểu diễn được giá trị này
char c2{99999};    // lỗi nếu char không biểu diễn được giá trị này
std::vector<int> v1{1, 2, 4, 5};      // hợp lệ
std::vector<int> v2{1, 2.3, 4, 5.6}; // LỖI: double sang int
```

Khi giá trị được biết lúc biên dịch, nó có thể được xét để quyết định một số chuyển đổi có bị coi là thu hẹp hay không. Tác giả dẫn lời Bjarne Stroustrup giải thích rằng điều này giúp tránh nhiều trường hợp không tương thích. Tuy nhiên, chuyển đổi từ số dấu phẩy động sang số nguyên luôn bị coi là thu hẹp, kể cả `7.0` sang `7`.

:::note Góc nhìn hiện đại
Ngoặc nhọn và ngoặc tròn không luôn tương đương: việc chọn hàm tạo và quy tắc thu hẹp có thể làm kết quả khác nhau. Kết quả khởi tạo phụ thuộc vào kiểu và ngữ cảnh.
:::

C++11 cung cấp template `std::initializer_list<>` để kiểu do người dùng định nghĩa hỗ trợ danh sách giá trị, hoặc để xử lý một danh sách nói chung:

```cpp
#include <initializer_list>
#include <iostream>

void print(std::initializer_list<int> vals) {
    for (auto p = vals.begin(); p != vals.end(); ++p) {
        std::cout << *p << "\n";
    }
}

// Lời gọi ví dụ:
print({12, 3, 5, 7, 11, 13, 17});
```

Nếu lớp có cả hàm tạo nhận một số đối số cụ thể và hàm tạo nhận `initializer_list`, khởi tạo bằng ngoặc nhọn ưu tiên hàm tạo danh sách khi phù hợp:

```cpp
class P {
public:
    P(int, int);
    P(std::initializer_list<int>);
};
P p(77, 5);       // P(int, int)
P q{77, 5};       // P(initializer_list)
P r{77, 5, 42};   // P(initializer_list)
P s = {77, 5};    // P(initializer_list)
```

Không có hàm tạo danh sách, `q` và `s` gọi hàm tạo hai số nguyên; `r` không hợp lệ.

Danh sách khởi tạo cũng làm `explicit` quan trọng với hàm tạo nhiều đối số: nó ngăn chuyển đổi ngầm từ nhiều giá trị, kể cả khi dùng cú pháp khởi tạo với `=`.

```cpp
class P {
public:
    P(int a, int b) { /* ... */ }
    explicit P(int a, int b, int c) { /* ... */ }
};
P x(77, 5);        // hợp lệ
P y{77, 5};        // hợp lệ
P z{77, 5, 42};    // hợp lệ: khởi tạo trực tiếp
P v = {77, 5};     // hợp lệ
P w = {77, 5, 42}; // LỖI: hàm tạo được chọn là explicit

void fp(const P&);
fp({47, 11});       // hợp lệ: chuyển đổi ngầm sang P
fp({47, 11, 3});    // LỖI: cần hàm tạo explicit
fp(P{47, 11});      // hợp lệ: tạo P tường minh
fp(P{47, 11, 3});   // hợp lệ: tạo P tường minh
```

Tương tự, hàm tạo `explicit` nhận `initializer_list` ngăn chuyển đổi ngầm từ danh sách có không, một hoặc nhiều giá trị.

### 3.1.4 Vòng lặp `for` theo phạm vi

C++11 giới thiệu dạng `for` đi qua các phần tử của một phạm vi, mảng hoặc tập hợp; các ngôn ngữ khác thường gọi đây là `foreach`:

```cpp
for (khai_bao_phan_tu : tap_hop) {
    // xử lý phần tử
}
```

Ví dụ in các phần tử của một danh sách khởi tạo:

```cpp
for (int i : {2, 3, 5, 7, 9, 13, 17, 19}) {
    std::cout << i << std::endl;
}
```

Để nhân mỗi phần tử của vector với 3, cần tham chiếu:

```cpp
std::vector<double> vec;
// ... thêm dữ liệu
for (auto& elem : vec) {
    elem *= 3;
}
```

Với container thông thường như `vector<double>`, nếu không dùng tham chiếu, thân vòng lặp xử lý một bản sao cục bộ của từng phần tử; đôi khi điều đó cũng hữu ích. Một số iterator trả đối tượng đại diện (*proxy*) thay vì tham chiếu thông thường, nên `auto` có thể sao chép proxy mà vẫn tác động tới dữ liệu gốc. Khi chỉ đọc đối tượng mà không muốn sao chép, thường nên dùng tham chiếu hằng để tránh tạo và hủy một bản sao cho mỗi phần tử:

```cpp
template <typename T>
void printElements(const T& coll) {
    for (const auto& elem : coll) {
        std::cout << elem << std::endl;
    }
}
```

Với container có `begin()` và `end()` là hàm thành viên, có thể hình dung việc duyệt tương tự:

```cpp
{
    auto pos = coll.begin();
    auto end = coll.end();
    for (; pos != end; ++pos) {
        const auto& elem = *pos;
        std::cout << elem << std::endl;
    }
}
```

Nói chung, khai báo phần tử được khởi tạo từ `*pos`; phạm vi được duyệt đến `end()`. Ngôn ngữ còn hỗ trợ tìm các hàm `begin(coll)` và `end(coll)` phù hợp, cũng như mảng kiểu C có kích thước đã biết. Có thể duyệt `std::initializer_list<>` vì nó cung cấp `begin()` và `end()` thành viên.

:::note Góc nhìn hiện đại
Mã mở rộng trên là mô hình giải thích, không bao quát mọi quy tắc tra cứu `begin`/`end` và thời hạn sống của phạm vi, vốn cần được xét theo phiên bản C++ và kiểu cụ thể.
:::

Vòng lặp lấy các iterator giới hạn trước khi duyệt. Vì vậy, không nên thêm phần tử vào chính `vector` đang được duyệt bằng range-based `for`: `push_back` có thể làm iterator mất hiệu lực, kể cả iterator kết thúc được lưu ban đầu. Nếu cần tạo thêm phần tử dựa trên dữ liệu cũ, có thể ghi sang một vector riêng:

```cpp
#include <cassert>
#include <vector>

int main() {
    const std::vector<int> source{1, 2, 3};
    std::vector<int> doubled;
    doubled.reserve(source.size());
    for (int value : source) doubled.push_back(value * 2);
    assert((doubled == std::vector<int>{2, 4, 6}));
}
```

`reserve` ở đây chỉ giảm khả năng cấp phát lại ở vector đích; điều làm vòng lặp an toàn là không thay đổi cấu trúc của `source` trong lúc duyệt.

Ví dụ với mảng C và danh sách khởi tạo:

```cpp
int array[] = {1, 2, 3, 4, 5};
long sum = 0;
for (int x : array) {
    sum += x;
}
for (auto elem : {sum, sum * 2, sum * 4}) {
    std::cout << elem << std::endl;
}
```

Kết quả lần lượt là `15`, `30`, `60`. Việc khởi tạo biến phần tử không sử dụng chuyển đổi `explicit` một cách ngầm định. Vì vậy ví dụ sau không biên dịch:

```cpp
class C {
public:
    explicit C(const std::string& s);
    // ...
};
std::vector<std::string> vs;
for (const C& elem : vs) { // LỖI: không có chuyển đổi ngầm string -> C
    std::cout << elem << std::endl;
}
```

Giả sử lớp `C` còn cung cấp phép xuất ra stream phù hợp; lỗi được nhấn mạnh ở đây là chuyển đổi `explicit` không được áp dụng ngầm.
