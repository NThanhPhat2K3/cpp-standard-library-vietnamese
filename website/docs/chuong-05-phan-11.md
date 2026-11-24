---
id: chuong-05-phan-11
title: 'Chương 5 · Mục đích của type traits'
sidebar_label: '05 · Phần 11: Mục đích type traits'
---

# 5.4–5.4.1 · Type traits và tiện ích kiểu

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 122–125 (PDF trang 151–154). Các hộp “Góc nhìn hiện đại” là phần bổ sung.

Phần lớn thư viện chuẩn C++ dựa trên template. Để hỗ trợ lập trình template — đôi khi được gọi là *metaprogramming* — thư viện cung cấp các tiện ích cho cả người dùng và người triển khai thư viện.

**Type traits**, xuất hiện trong TR1 và được mở rộng ở C++11, giúp xác định hành vi dựa trên kiểu. Chẳng hạn, mã tổng quát có thể chọn một cách xử lý phù hợp với khả năng của kiểu. Các tiện ích khác như reference wrapper và function wrapper cũng hỗ trợ công việc này; sách sẽ trình bày sau.

## Type trait dùng để làm gì?

Type trait là một template cho biết một **giá trị hoặc kiểu tại thời điểm biên dịch** dựa trên một hay nhiều đối số template, thường là kiểu. Ví dụ `std::is_pointer` trong `<type_traits>` kiểm tra một kiểu có phải kiểu con trỏ hay không:

```cpp
#include <iostream>
#include <type_traits>

template <typename T>
void foo(const T& val) {
    if (std::is_pointer<T>::value) {
        std::cout << "foo() called for a pointer\n";
    } else {
        std::cout << "foo() called for a value\n";
    }
    // ...
}
```

Giá trị `std::is_pointer<T>::value` là `true` hoặc `false` tùy `T`. Vì cả hai nhánh trong ví dụ chỉ in chuỗi, chúng đều hợp lệ với mọi `T` phù hợp.

### Vì sao toán tử `?:` không đủ?

Đoạn sau không phải cách tổng quát hợp lệ:

```cpp
template <typename T>
void foo(const T& val) {
    std::cout << (std::is_pointer<T>::value ? *val : val) << '\n';
}
```

Dù điều kiện được biết lúc biên dịch, cả hai toán hạng của `?:` vẫn phải hợp lệ và đáp ứng quy tắc xác định kiểu của biểu thức. Với `T = int`, `*val` không hợp lệ; điều kiện `false` không xóa lỗi đó. Ngay cả với một số kiểu con trỏ, hai nhánh có thể không có kiểu chung phù hợp.

### Chọn overload theo tag

C++11 có thể dùng **tag dispatch**: tạo một đối tượng kiểu mang giá trị đúng/sai để chọn overload phù hợp.

```cpp
template <typename T>
void foo_impl(const T& val, std::true_type) {
    std::cout << "foo() called for pointer to " << *val << '\n';
}

template <typename T>
void foo_impl(const T& val, std::false_type) {
    std::cout << "foo() called for value to " << val << '\n';
}

template <typename T>
void foo(const T& val) {
    foo_impl(val, std::is_pointer<T>());
}
```

`std::is_pointer<T>` là một trait kiểu có thể dùng làm tag và kế thừa từ một specialization `integral_constant` tương ứng; overload phù hợp nhận `std::true_type` hoặc `std::false_type`. Chỉ implementation được chọn mới cần được khởi tạo cho lời gọi tương ứng.

:::warning Giới hạn ví dụ
`is_pointer` chỉ nói `T` là kiểu con trỏ; nó không bảo đảm con trỏ khác null hoặc `*val` có thể được in. Ví dụ cần thêm các tiền điều kiện đó. `void*` cũng là pointer nhưng không thể giải tham chiếu như trên.
:::

Sách đặt câu hỏi tại sao không chỉ tạo các overload riêng. Một lý do là khi có nhiều thuộc tính kiểu và nhiều nhóm, số overload có thể lớn; traits còn là các khối xây dựng có thể kết hợp trong mã tổng quát. Đoạn sách minh họa cú pháp `void foo<T*>(...)` như “partial specialization” của function template: cần lưu ý **function template không hỗ trợ partial specialization**. Có thể dùng overload hàm với tham số con trỏ thay thế, nhưng nó không tương đương cú pháp partial specialization đó.

:::note Góc nhìn hiện đại
Từ C++17, `if constexpr` cho phép loại bỏ nhánh không được chọn khi khởi tạo template, trong các điều kiện thích hợp. C++20 concepts và constraints còn cho phép mô tả yêu cầu trên kiểu rõ ràng hơn. Tag dispatch vẫn cần thiết khi hỗ trợ C++11 và hữu ích để hiểu thư viện cũ.
:::

## Chọn cách xử lý cho kiểu số nguyên

Nếu một hàm cần xử lý khác nhau với số nguyên và số dấu phẩy động, một cách là viết overload cho từng kiểu: `short`, `unsigned short`, `int`, … và `float`, `double`, `long double`. Cách đó lặp lại nhiều và cần bổ sung khi tập kiểu thay đổi. Dựa trên ví dụ được sách ghi nhận từ Pete Becker, có thể dùng trait:

```cpp
template <typename T>
void foo_impl(T val, std::true_type);  // xử lý kiểu integral

template <typename T>
void foo_impl(T val, std::false_type); // xử lý các kiểu còn lại

template <typename T>
void foo(T val) {
    foo_impl(val, std::is_integral<T>());
}
```

Hai overload được chọn dựa trên `std::is_integral<T>`. Theo chuẩn, nhóm integral bao gồm cả `bool` và các kiểu ký tự; chú thích của sách cho biết chúng không phải trọng tâm của ví dụ.

:::warning Nhánh `false` không đồng nghĩa floating-point
`is_integral<T> == false` cũng đúng với kiểu lớp, enum và nhiều kiểu khác, không chỉ `float`/`double`. Nếu chỉ muốn nhận số nguyên hoặc số dấu phẩy động, cần thêm ràng buộc hoặc kiểm tra `std::is_floating_point`. Không tự specialize các type trait chuẩn như `std::is_integral` cho kiểu người dùng trừ khi chuẩn cho phép; việc tự ý làm vậy không hợp lệ.
:::

## Tìm kiểu chung với `common_type`

Khi xử lý hai giá trị khác kiểu, có thể cần một kiểu chung cho kết quả, chẳng hạn kết quả phép cộng hoặc hàm tìm giá trị nhỏ hơn:

```cpp
template <typename T1, typename T2>
typename std::common_type<T1, T2>::type
minimum(const T1& x, const T2& y);
```

Theo ví dụ sách, kiểu chung của `int` và `int` là `int`, của `int` và `long` là `long`; trong các trường hợp chuyển đổi phù hợp, `std::string` và `const char*` có thể cho kiểu chung `std::string`.

Sách giải thích ý tưởng bằng quy tắc tìm kiểu kết quả của toán tử `?:`, kết hợp `decltype` và `std::declval`:

```cpp
// Mô hình giải thích, không phải implementation đầy đủ của chuẩn
template <typename T1, typename T2>
struct illustrative_common_type {
    typedef decltype(true ? std::declval<T1>() : std::declval<T2>()) type;
};
```

`decltype` lấy kiểu của biểu thức; `declval<T>()` cho phép hình thành biểu thức đại diện cho một giá trị kiểu `T` trong ngữ cảnh không được đánh giá, không cần tạo đối tượng thực. Nếu không có kiểu chung hợp lệ, không thể tùy tiện dùng `::type`. Sách nêu thư viện `chrono` có các quy tắc kiểu chung để kết hợp duration.

:::note Góc nhìn hiện đại
Đoạn trên chỉ minh họa ý tưởng; `std::common_type` thực tế có thêm decay, các trường hợp nhiều đối số và quy tắc specialization. Chỉ được thêm specialization vào namespace `std` khi chuẩn cho phép và các điều kiện cụ thể được đáp ứng. Từ C++14 có alias `std::common_type_t<T1, T2>`.
:::

Phần tiếp theo của sách là bảng type predicates và các phép biến đổi kiểu trong mục 5.4.2.
