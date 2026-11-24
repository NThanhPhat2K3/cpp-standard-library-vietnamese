---
id: chuong-03-phan-4
title: 'Chương 3 · Template và lambda'
sidebar_label: '03 · Phần 4: Template và lambda'
---

# 3.1.9–3.1.10 · Template và lambda

> **Phạm vi:** Mục 3.1.9 và 3.1.10. Chương 3 vẫn đang được dịch.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 26–31 (PDF trang 55–60). Các hộp “Góc nhìn hiện đại” là phần bổ sung.

## 3.1.9 Những tính năng template mới

### Variadic template

Từ C++11, template có thể nhận một số lượng đối số template thay đổi; đó là **variadic template**. Ví dụ sau cho phép gọi `print()` với nhiều đối số thuộc các kiểu khác nhau:

```cpp
void print() {
}

template <typename T, typename... Types>
void print(const T& firstArg, const Types&... args) {
    std::cout << firstArg << std::endl; // in đối số đầu
    print(args...);                    // gọi với các đối số còn lại
}
```

Khi có một hoặc nhiều đối số, hàm template được dùng: đối số đầu được tách ra để in, sau đó hàm gọi đệ quy với các đối số còn lại. Overload `print()` không phải template kết thúc đệ quy khi không còn đối số.

```cpp
print(7.5, "hello", std::bitset<16>(377), 42);
```

Kết quả:

```text
7.5
hello
0000000101111001
42
```

Sách nói thêm về `bitset` ở mục 12.5.1. Tại thời điểm viết sách, tác giả ghi rằng khả năng hợp lệ của cách thay overload không đối số bằng overload một đối số sau còn được thảo luận: về hình thức, với một đối số, dạng variadic có thể gây câu hỏi về tính mơ hồ so với dạng không variadic, dù các trình biên dịch thường chấp nhận.

```cpp
template <typename T>
void print(const T& arg) {
    std::cout << arg << std::endl;
}

template <typename T, typename... Types>
void print(const T& firstArg, const Types&... args) {
    std::cout << firstArg << std::endl;
    print(args...);
}
```

Trong variadic template, `sizeof...(args)` cho số đối số trong parameter pack `args`. Lớp `std::tuple<>` sử dụng nhiều tính năng này; xem mục 5.1.2 của sách.

:::note Góc nhìn hiện đại
Ghi chú về việc còn thảo luận ở trên phản ánh thời điểm sách được viết. Khi dùng kỹ thuật tương tự, nên kiểm tra lựa chọn overload bằng trình biên dịch và phiên bản C++ mục tiêu. Từ C++17 có thể dùng fold expression cho nhiều phép xử lý pack, nhưng cách đệ quy trên vẫn hữu ích để hiểu C++11.
:::

### Alias template

C++11 hỗ trợ định nghĩa bí danh kiểu có tham số template bằng `using`; cách này được gọi là **alias template**. Sách ghi rằng các hướng dùng từ khóa `typename` cho tính năng này không thành công, nên `using` được chọn.

```cpp
template <typename T>
using Vec = std::vector<T, MyAlloc<T>>;

Vec<int> coll;
```

Khai báo `coll` tương đương với:

```cpp
std::vector<int, MyAlloc<int>> coll;
```

Ở đây `MyAlloc` là allocator do người dùng cung cấp. Sách nêu thêm ví dụ ở mục 5.2.5.

### Các thay đổi template khác

Từ C++11, function template có thể có đối số template mặc định. Kiểu được khai báo cục bộ cũng có thể làm đối số template. Ngoài ra, hàm có *internal linkage* có thể được dùng làm đối số cho tham số template phi kiểu là con trỏ hoặc tham chiếu tới hàm.

## 3.1.10 Lambda

C++11 giới thiệu **lambda**, cho phép định nghĩa hành vi ngay tại chỗ để dùng làm đối số hoặc lưu trong đối tượng cục bộ. Lambda ảnh hưởng đáng kể đến cách dùng thư viện chuẩn: sách thảo luận về lambda với thuật toán và container STL ở mục 6.9 và 10.3, và dùng lambda cho mã chạy đồng thời ở mục 18.1.2.

### Cú pháp

Một lambda có thể xuất hiện trong câu lệnh hoặc biểu thức, giống một hàm được định nghĩa tại chỗ. Lambda tối giản sau không có tham số:

```cpp
[] {
    std::cout << "hello lambda" << std::endl;
}
```

Có thể gọi ngay, hoặc lưu đối tượng được tạo ra rồi gọi sau:

```cpp
[] { std::cout << "hello lambda" << std::endl; }();

auto l = [] {
    std::cout << "hello lambda" << std::endl;
};
l(); // in hello lambda
```

Cặp ngoặc vuông mở đầu được gọi là *lambda introducer*. Bên trong đó có thể chỉ định **capture** để truy cập dữ liệu bên ngoài có thời hạn lưu trữ tự động. Khi không cần capture thì để `[]`; các đối tượng có thời hạn lưu trữ tĩnh như `std::cout` vẫn có thể được dùng theo quy tắc tra cứu thông thường.

Trong cú pháp C++11 mà sách trình bày, sau capture có thể có danh sách tham số, `mutable`, đặc tả ngoại lệ, thuộc tính và kiểu trả về. Những phần này là tùy chọn; khi dùng các phần cần danh sách tham số, viết cặp ngoặc `()`:

```cpp
[] { /* ... */ }
[] (int x) mutable -> int { return x; }
```

Lambda có thể nhận tham số như hàm thông thường:

```cpp
auto l = [](const std::string& s) {
    std::cout << s << std::endl;
};
l("hello lambda");
```

Kiểu trả về có thể được suy luận, hoặc ghi sau `->`:

```cpp
[] { return 42; }             // trả về int
[]() -> double { return 42; } // trả về double
```

Trong cú pháp được mô tả ở sách, khi chỉ định kiểu trả về cần có `()` trước `->`. Cũng có thể ghi đặc tả ngoại lệ giữa danh sách tham số và kiểu trả về hoặc thân hàm; về đặc tả ngoại lệ, xem mục 3.1.7.

:::note Góc nhìn hiện đại
Sách nói lambda không thể là template và phải ghi rõ mọi kiểu tham số: đây là giới hạn của C++11. Từ C++14, *generic lambda* có thể nhận tham số `auto`; C++20 còn cho phép danh sách tham số template tường minh. Cú pháp lambda cũng được mở rộng qua các phiên bản, nên ví dụ trên đang mô tả cách viết C++11.
:::

### Capture: truy cập phạm vi bên ngoài

Danh sách capture cho phép lambda truy cập dữ liệu bên ngoài mà không truyền qua tham số:

- `[=]` đặt mặc định capture theo giá trị đối với các thực thể cục bộ phù hợp được dùng trong lambda.
- `[&]` đặt mặc định capture theo tham chiếu đối với các thực thể cục bộ phù hợp được dùng trong lambda.
- Có thể liệt kê cụ thể và kết hợp, chẳng hạn `[x, &y]`.

Ví dụ:

```cpp
int x = 0;
int y = 42;
auto qqq = [x, &y] {
    std::cout << "x: " << x << std::endl;
    std::cout << "y: " << y << std::endl;
    ++y;
};
x = y = 77;
qqq();
qqq();
std::cout << "final y: " << y << std::endl;
```

Kết quả:

```text
x: 0
y: 77
x: 0
y: 78
final y: 79
```

`x` được capture theo giá trị khi lambda được tạo, nên bản sao giữ giá trị `0`; theo mặc định không thể `++x` bên trong lambda này. `y` được capture theo tham chiếu, nên lambda thấy giá trị đã đổi thành `77` và hai lời gọi tăng giá trị gốc lên `79`. Có thể viết `[=, &y]` để mặc định capture theo giá trị, riêng `y` theo tham chiếu.

:::warning Thời hạn sống
Capture theo tham chiếu không kéo dài thời hạn sống của đối tượng được tham chiếu. Nếu lambda được lưu hoặc chạy sau khi đối tượng ấy đã bị hủy, việc truy cập sẽ không an toàn.
:::

### `mutable` và trạng thái của lambda

`mutable` cho phép sửa **bản sao** đã capture theo giá trị bên trong đối tượng lambda:

```cpp
int id = 0;
auto f = [id]() mutable {
    std::cout << "id: " << id << std::endl;
    ++id;
};
id = 42;
f();
f();
f();
std::cout << id << std::endl;
```

Kết quả:

```text
id: 0
id: 1
id: 2
42
```

Lambda giữ một bản sao riêng của `id`, còn biến bên ngoài vẫn là `42`. Có thể hình dung lambda trên tương tự một function object với `id` là thành viên và `operator()` không phải hàm thành viên `const`:

```cpp
class Example {
    int id; // bản sao của id bên ngoài
public:
    void operator()() {
        std::cout << "id: " << id << std::endl;
        ++id;
    }
};
```

Không có `mutable`, `operator()` của lambda thông thường là `const`, vì vậy không thể trực tiếp sửa bản sao `id` trong ví dụ này. Với `mutable`, đối tượng lambda có thể giữ và thay đổi trạng thái qua các lời gọi. Sách bàn thêm các vấn đề có thể gặp ở mục 10.3.2.

### Kiểu của lambda

Mỗi biểu thức lambda tạo một kiểu closure duy nhất, không được đặt tên, hoạt động như một function object. Có thể dùng `auto` hoặc template để làm việc với đối tượng ấy; khi cần gọi tên kiểu trong một ngữ cảnh, `decltype` có thể hữu ích, chẳng hạn khi dùng lambda làm hàm băm hoặc tiêu chí sắp xếp cho container. Xem mục 6.9 và 7.9.7.

Một cách khác là dùng `std::function<>` làm kiểu bao cho callable có chữ ký mong muốn. Ví dụ trong sách:

```cpp
#include <functional>
#include <iostream>

std::function<int(int, int)> returnLambda() {
    return [](int x, int y) {
        return x * y;
    };
}

int main() {
    auto lf = returnLambda();
    std::cout << lf(6, 7) << std::endl;
}
```

Chương trình in `42`. Sách giới thiệu `std::function` ở mục 5.4.4.

:::note Góc nhìn hiện đại
Sách viết `std::function` là cách duy nhất chỉ định kiểu trả về cho hàm trả về lambda trong bối cảnh C++11 được trình bày. Từ C++14, một hàm có thể dùng `auto` để suy luận kiểu trả về closure; ngoài ra còn có các cách thiết kế khác tùy trường hợp. `std::function` dùng xóa kiểu (*type erasure*) và có thể có chi phí, nên không phải lúc nào cũng cần thiết.
:::
