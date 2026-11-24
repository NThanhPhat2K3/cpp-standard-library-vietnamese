---
id: chuong-03-phan-3
title: 'Chương 3 · String literal, noexcept và constexpr'
sidebar_label: '03 · Phần 3: Literal, noexcept, constexpr'
---

# 3.1.6–3.1.8 · Literal, `noexcept` và `constexpr`

> **Phạm vi:** Các mục 3.1.6–3.1.8. Chương 3 vẫn đang được dịch.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 23–26 (trang PDF 52–55). Các hộp “Góc nhìn hiện đại” là phần bổ sung.

## 3.1.6 Các dạng string literal mới

Từ C++11, ta có thể định nghĩa *raw string literal* và string literal với các kiểu mã hóa hoặc ký tự rộng.

### Raw string literal

Raw string cho phép viết trực tiếp chuỗi ký tự như nội dung mong muốn, nhờ đó giảm nhu cầu dùng ký tự escape. Dạng cơ bản bắt đầu bằng `R"(` và kết thúc bằng `)"`; nội dung có thể trải trên nhiều dòng.

Ví dụ, chuỗi chứa **hai dấu gạch chéo ngược rồi chữ `n`** có thể được viết bằng literal thông thường hoặc raw literal:

```cpp
"\\\\n"      // literal thông thường
R"(\\n)"     // raw literal: cùng nội dung
```

Để nội dung có thể chứa cả chuỗi kết thúc `)"`, dùng một dấu phân cách (*delimiter*) tùy chọn. Cú pháp tổng quát là:

```text
R"delim(nội dung)delim"
```

`delim` gồm tối đa 16 ký tự thuộc tập ký tự cơ bản, không có dấu gạch chéo ngược, khoảng trắng hoặc dấu ngoặc đơn. Dấu phân cách ở đầu và cuối phải giống nhau.

Ví dụ trong sách, với delimiter là `nc`:

```cpp
R"nc(a\
         b\nc()"
         )nc"
```

Nội dung gồm `a`, một dấu gạch chéo ngược, ký tự xuống dòng, một số khoảng trắng, `b`, dấu gạch chéo ngược, `n`, `c`, `(`, `)`, dấu ngoặc kép, một ký tự xuống dòng và khoảng trắng trước delimiter cuối. Dấu `\n` bên trong raw string là hai ký tự `\` và `n`, không tự trở thành ký tự xuống dòng.

Raw string đặc biệt hữu ích cho biểu thức chính quy vì thường chứa nhiều dấu gạch chéo ngược. Chương 14 trình bày thêm.

### String literal có tiền tố mã hóa

Tiền tố cho phép chỉ định loại mã hóa hoặc kiểu ký tự của literal:

| Tiền tố | Ý nghĩa theo C++11 |
|:---|:---|
| `u8` | Literal mã hóa UTF-8, với phần tử kiểu `const char`. |
| `u` | Literal có phần tử kiểu `const char16_t`. |
| `U` | Literal có phần tử kiểu `const char32_t`. |
| `L` | Wide string literal, với phần tử kiểu `const wchar_t`. |

Ví dụ, `L"hello"` là wide string literal. Tiền tố mã hóa cũng có thể đặt trước `R` của raw literal, chẳng hạn `u8R"(text)"`. Chương 16 bàn thêm về mã hóa và quốc tế hóa.

:::note Góc nhìn hiện đại
Từ C++20, phần tử của literal UTF-8 có tiền tố `u8` có kiểu `const char8_t`, thay vì `const char` như trong C++11. Kiểu của literal `u`, `U` và `L` cũng là các mảng ký tự `const` tương ứng; độ dài và mã hóa cần được xét riêng với cách hiển thị ký tự.
:::

## 3.1.7 Từ khóa `noexcept`

C++11 cung cấp `noexcept` để khai báo rằng một hàm không để ngoại lệ thoát ra ngoài:

```cpp
void foo() noexcept;
```

Nếu một ngoại lệ phát sinh bên trong `foo()` mà không được xử lý tại đó và thoát khỏi hàm, chương trình gọi `std::terminate()`. Cơ chế mặc định của terminate handler gọi `std::abort()`; sách bàn thêm về `abort` ở mục 5.8.2.

Theo phần thảo luận mà sách dẫn từ đề xuất N3051, các đặc tả ngoại lệ động trước đây gặp một số vấn đề:

- **Kiểm tra lúc chạy:** việc kiểm tra không chứng minh tại thời điểm biên dịch rằng mọi ngoại lệ đều đã được xử lý; cơ chế lỗi qua `std::unexpected()` cũng khó dùng để phục hồi.
- **Chi phí lúc chạy:** mã phục vụ kiểm tra có thể tăng chi phí và cản trở tối ưu hóa.
- **Khó dùng trong mã tổng quát:** nhìn chung không thể biết trước chính xác những kiểu ngoại lệ mà thao tác trên các đối số template có thể phát sinh.

Theo lập luận đó, hai mức đảm bảo thường hữu ích nhất là một thao tác có thể phát sinh ngoại lệ bất kỳ, hoặc cam kết không để ngoại lệ nào thoát ra. Dạng đầu có thể biểu thị bằng cách không ghi đặc tả; dạng thứ hai trước đây có thể viết bằng `throw()`, nhưng ít được dùng vì vấn đề hiệu năng. `noexcept` cung cấp cách biểu thị cam kết không ném mà không yêu cầu cơ chế kiểm tra và stack unwinding giống các đặc tả động cũ. Sách ghi rằng các đặc tả ngoại lệ động đã bị khuyến cáo không dùng từ C++11.

:::note Góc nhìn hiện đại
`noexcept` không có nghĩa là không thể viết biểu thức có thể ném trong thân hàm: nếu ngoại lệ thoát ra khỏi hàm thì `std::terminate()` được gọi. Không nên phụ thuộc vào việc stack có được unwinding hay không trước khi terminate. Các đặc tả ngoại lệ động kiểu `throw(T)` đã bị loại từ C++17; `throw()` cũ còn được xử lý như đặc tả không ném trong các phiên bản hiện đại.
:::

### `noexcept` có điều kiện

Có thể chỉ định điều kiện boolean để một hàm được xem là không ném. Ví dụ minh họa trong sách:

```cpp
void swap(Type& x, Type& y) noexcept(noexcept(x.swap(y))) {
    x.swap(y);
}
```

`noexcept` không có điều kiện là cách viết ngắn của `noexcept(true)`. Ở ví dụ trên:

- `noexcept(...)` **bên ngoài** là đặc tả của hàm `swap`.
- `noexcept(x.swap(y))` **bên trong** là toán tử cho giá trị boolean cho biết biểu thức đó có được xem là không ném hay không; biểu thức được kiểm tra không thực sự được thực thi bởi toán tử này.

Vì vậy hàm `swap` toàn cục trong ví dụ chỉ được khai báo không ném khi lời gọi `x.swap(y)` không ném.

Một ví dụ khác trong sách là phép gán move của `pair`:

```cpp
pair& operator=(pair&& p)
    noexcept(is_nothrow_move_assignable<T1>::value &&
             is_nothrow_move_assignable<T2>::value);
```

Type trait `is_nothrow_move_assignable` kiểm tra liệu phép gán move tương ứng có thể được thực hiện mà không ném hay không. Sách trình bày type traits ở mục 5.4.2; chữ ký trên minh họa cách tiếp cận của ấn bản sách.

### Cách áp dụng trong thư viện theo sách

Sách dẫn đề xuất N3279 và mô tả cách tiếp cận thận trọng khi bổ sung `noexcept` vào thư viện C++11:

1. Một hàm thư viện không thể ném và không quy định hành vi không xác định, chẳng hạn do vi phạm tiền điều kiện, nên được đánh dấu `noexcept` vô điều kiện.
2. Hàm `swap`, move constructor hoặc move assignment của thư viện, nếu có thể chứng minh không ném bằng toán tử `noexcept`, nên có `noexcept` theo điều kiện; sách nêu rằng các hàm khác không nên dùng dạng có điều kiện trong cách tiếp cận này.
3. Destructor của thư viện không nên ném và phải sử dụng đặc tả ngoại lệ không ném được cung cấp ngầm.
4. Hàm thư viện được thiết kế để tương thích với mã C có thể được đánh dấu `noexcept` vô điều kiện.

Theo sách, việc không tùy tiện đánh dấu `noexcept` cho một hàm có tiền điều kiện mà vi phạm dẫn đến hành vi không xác định cho phép bản triển khai cung cấp chế độ an toàn: khi dùng sai, chế độ đó có thể ném ngoại lệ báo vi phạm tiền điều kiện. Đây là mô tả bối cảnh thiết kế trong sách, không phải một quy tắc suy ra áp dụng cho mọi phiên bản thư viện.

Để dễ đọc và tiết kiệm chỗ, tác giả thường bỏ qua đặc tả `noexcept` khi trình bày chữ ký trong sách.

## 3.1.8 Từ khóa `constexpr`

Từ C++11, `constexpr` cho phép biểu thức đủ điều kiện được tính tại thời điểm biên dịch. Ví dụ:

```cpp
constexpr int square(int x) {
    return x * x;
}

float a[square(9)]; // 81 phần tử; kích thước là hằng biểu thức
```

Từ khóa này giải quyết một vấn đề khi dùng giới hạn số trong C++98. Trước C++11, một biểu thức như `std::numeric_limits<short>::max()` không dùng được như hằng biểu thức số nguyên, dù về chức năng nó cho biết một giới hạn kiểu số tương tự các macro giới hạn số nguyên. Từ C++11, hàm được khai báo `constexpr`, nên có thể dùng trong kích thước mảng hoặc tính toán tại thời điểm biên dịch:

```cpp
#include <array>
#include <limits>

std::array<float, std::numeric_limits<short>::max()> a;
```

Sách thường bỏ qua đặc tả `constexpr` trong phần chữ ký để dễ đọc và tiết kiệm chỗ. Lưu ý: sách so sánh với macro `INT_MAX`, nhưng giới hạn tương ứng chính xác với `short` là `SHRT_MAX`; hai macro này không nhất thiết bằng nhau.

:::note Góc nhìn hiện đại
`constexpr` cho phép tính tại thời điểm biên dịch khi đối số và ngữ cảnh đáp ứng yêu cầu; gọi một hàm `constexpr` với dữ liệu chỉ có lúc chạy không tự động biến lời gọi đó thành phép tính lúc biên dịch. Quy tắc dành cho hàm `constexpr` cũng được mở rộng trong các phiên bản C++ sau C++11.
:::
