---
id: chuong-05-phan-12
title: 'Chương 5 · Type traits chi tiết'
sidebar_label: '05 · Phần 12: Type traits chi tiết'
---

# 5.4.2 · Type traits chi tiết

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 125–132 (PDF trang 154–161). Các bảng chuyển ngữ nội dung C++11 của sách; các ghi chú hiện đại được đánh dấu riêng.

Phần lớn type traits nằm trong `<type_traits>`. Các **type predicate** cho biết thuộc tính có đúng hay không. `std::true_type` và `std::false_type` là các specialization của `std::integral_constant<bool, ...>` và có thành viên `value` tương ứng.

```cpp
static_assert(std::is_pointer<int*>::value, "int* la con tro");
static_assert(!std::is_pointer<int>::value, "int khong la con tro");
```

## Kiểm tra thuộc tính một kiểu

| Trait `std::...<T>` | Thuộc tính được kiểm tra |
|:---|:---|
| `is_void` | Kiểu `void`. |
| `is_integral` | Kiểu số nguyên, gồm `bool` và các kiểu ký tự. |
| `is_floating_point` | Kiểu dấu phẩy động. |
| `is_arithmetic` | Kiểu số nguyên hoặc dấu phẩy động. |
| `is_signed`, `is_unsigned` | Kiểu số học có dấu hoặc không dấu theo định nghĩa của trait. |
| `is_const`, `is_volatile` | Bản thân `T` có qualifier tương ứng. |
| `is_array` | Mảng ngôn ngữ C++, không phải `std::array`. |
| `is_enum`, `is_union`, `is_class` | Enum, union hoặc class/struct không phải union. |
| `is_function` | Kiểu hàm. |
| `is_reference`, `is_lvalue_reference`, `is_rvalue_reference` | Tham chiếu, tham chiếu lvalue hoặc rvalue. |
| `is_pointer` | Con trỏ thường, gồm con trỏ hàm; không gồm con trỏ tới nonstatic member. |
| `is_member_pointer` | Con trỏ tới thành viên không static. |
| `is_member_object_pointer`, `is_member_function_pointer` | Con trỏ tới dữ liệu thành viên hoặc hàm thành viên không static. |
| `is_fundamental` | Kiểu cơ bản: `void`, số học hoặc `std::nullptr_t`. |
| `is_scalar` | Số học, enum, con trỏ, member pointer hoặc `std::nullptr_t`. |
| `is_object` | Kiểu đối tượng: không phải hàm, tham chiếu hay `void`. |
| `is_compound` | Kiểu compound, đối lập với fundamental. |
| `is_trivial`, `is_trivially_copyable`, `is_standard_layout` | Các thuộc tính cấu trúc và thao tác trivial/standard-layout tương ứng. |
| `is_pod`, `is_literal_type` | Các phân loại lịch sử được sách C++11 liệt kê. |

*Bảng 5.13, trang 126.* `std::nullptr_t` là fundamental; `bool` và các kiểu ký tự là integral.

### Thuộc tính của lớp và thao tác

| Trait `std::...<T>` | Điều được kiểm tra |
|:---|:---|
| `is_empty` | Lớp rỗng theo quy tắc chuẩn. |
| `is_polymorphic` | Lớp đa hình, có hoặc thừa hưởng hàm ảo. |
| `is_abstract` | Lớp trừu tượng. |
| `has_virtual_destructor` | Có destructor ảo. |
| `is_default_constructible`, `is_copy_constructible`, `is_move_constructible` | Có thể khởi tạo theo cách tương ứng. |
| `is_copy_assignable`, `is_move_assignable`, `is_destructible` | Có thể gán hoặc hủy theo cách tương ứng. |
| `is_trivially_default_constructible`, `is_trivially_copy_constructible`, `is_trivially_move_constructible` | Các phép khởi tạo tương ứng là trivial. |
| `is_trivially_copy_assignable`, `is_trivially_move_assignable`, `is_trivially_destructible` | Phép gán hoặc hủy tương ứng là trivial. |
| `is_nothrow_default_constructible`, `is_nothrow_copy_constructible`, `is_nothrow_move_constructible` | Các phép khởi tạo tương ứng không ném theo trait. |
| `is_nothrow_copy_assignable`, `is_nothrow_move_assignable`, `is_nothrow_destructible` | Phép gán hoặc hủy tương ứng không ném theo trait. |

*Bảng 5.14, trang 127.* Các trait constructible/assignable kiểm tra **biểu thức có hợp lệ không**, không chứng minh chắc chắn một hàm move chuyên biệt tồn tại: copy constructor nhận `const T&` có thể nhận rvalue. Các trait `is_nothrow...` hữu ích khi viết `noexcept` có điều kiện.

```cpp
std::is_const<int>::value;                 // false
std::is_const<const volatile int>::value;  // true
std::is_const<int* const>::value;          // true: con trỏ là const
std::is_const<const int*>::value;          // false: đối tượng được trỏ là const
std::is_const<const int&>::value;          // false: T là kiểu tham chiếu
std::is_const<int[3]>::value;              // false
std::is_const<const int[3]>::value;        // true
std::is_const<int[]>::value;               // false
std::is_const<const int[]>::value;         // true
```

:::note Góc nhìn hiện đại
Một số trait trong bảng mang tính lịch sử: `is_pod` bị khuyến cáo không dùng từ C++20, `is_literal_type` bị khuyến cáo không dùng từ C++17 và bị loại khỏi chuẩn C++20. `memcpy` chỉ an toàn dưới những điều kiện cụ thể, không phải với mọi đối tượng tùy ý. Nhiều trait có tiền điều kiện về kiểu đầy đủ; kiểm tra hợp đồng trước khi áp dụng cho incomplete type.
:::

## Quan hệ giữa các kiểu

| Trait | Câu hỏi |
|:---|:---|
| `is_same<T1,T2>` | Hai kiểu có giống nhau, kể cả cv-qualifier? |
| `is_base_of<Base,Derived>` | Có quan hệ lớp cơ sở theo quy tắc trait? |
| `is_convertible<From,To>` | Có thể chuyển đổi ngầm từ `From` sang `To`? |
| `is_constructible<T,Args...>` | Có thể khởi tạo `T` từ các kiểu đối số? |
| `is_trivially_constructible<T,Args...>` | Việc khởi tạo hợp lệ và trivial? |
| `is_nothrow_constructible<T,Args...>` | Việc khởi tạo hợp lệ và không ném? |
| `is_assignable<T,U>` | Biểu thức gán từ `U` vào biểu thức kiểu `T` có hợp lệ? |
| `is_trivially_assignable<T,U>` | Phép gán hợp lệ và trivial? |
| `is_nothrow_assignable<T,U>` | Phép gán hợp lệ và không ném? |
| `uses_allocator<T,Alloc>` | `T` hỗ trợ giao thức allocator tương ứng với `Alloc`? |

*Bảng 5.15, trang 128; `uses_allocator` được định nghĩa trong `<memory>`.* `is_base_of` không đồng nghĩa chắc chắn có thể chuyển đổi con trỏ: kế thừa private hoặc mơ hồ vẫn ảnh hưởng chuyển đổi.

Kiểu đối số đầu của `is_assignable` ảnh hưởng loại giá trị của biểu thức được kiểm tra. Với kiểu cơ bản, `int` là rvalue trong mô hình kiểm tra và không thể gán như một lvalue:

```cpp
std::is_assignable<int, int>::value;                 // false
std::is_assignable<int&, int>::value;                // true
std::is_assignable<int&&, int>::value;               // false
std::is_assignable<long&, int>::value;               // true
std::is_assignable<int&, void*>::value;              // false
std::is_assignable<void*, int>::value;               // false
std::is_assignable<const char*, std::string>::value; // false
std::is_assignable<std::string, const char*>::value; // true
```

Một số lớp cho phép gọi `operator=` trên rvalue, nên kết quả với kiểu lớp không giống kiểu cơ bản trong mọi trường hợp. Với constructor:

```cpp
std::is_constructible<int>::value;                         // true
std::is_constructible<int, int>::value;                    // true
std::is_constructible<long, int>::value;                   // true
std::is_constructible<int, void*>::value;                  // false
std::is_constructible<void*, int>::value;                  // false
std::is_constructible<const char*, std::string>::value;     // false
std::is_constructible<std::string, const char*>::value;     // true
std::is_constructible<std::string, const char*, int, int>::value; // true
```

## Biến đổi kiểu

| Trait | Kết quả `::type` |
|:---|:---|
| `remove_const<T>`, `remove_volatile<T>`, `remove_cv<T>` | Bỏ qualifier tương ứng ở mức trên cùng. |
| `add_const<T>`, `add_volatile<T>`, `add_cv<T>` | Thêm qualifier tương ứng khi áp dụng được. |
| `make_signed<T>`, `make_unsigned<T>` | Kiểu số nguyên có dấu/không dấu tương ứng theo điều kiện trait. |
| `remove_reference<T>` | Bỏ tham chiếu. |
| `add_lvalue_reference<T>`, `add_rvalue_reference<T>` | Thêm tham chiếu với quy tắc reference collapsing. |
| `remove_pointer<T>` | Bỏ một mức con trỏ nếu `T` là con trỏ. |
| `add_pointer<T>` | Tạo kiểu con trỏ đến kiểu sau khi bỏ tham chiếu, khi áp dụng được. |

*Bảng 5.16, trang 130.* Với `T = int`, các phép thêm `const`, lvalue reference, rvalue reference và pointer lần lượt cho `const int`, `int&`, `int&&`, `int*`; `make_unsigned<T>::type` là `unsigned int`.

Với `T = const int&`, `remove_const<T>::type` vẫn là `const int&`: tham chiếu không phải bản thân một kiểu `const`; muốn bỏ `const` của đối tượng tham chiếu, cần bỏ reference trước. `add_rvalue_reference<T>::type` vẫn là `const int&` do reference collapsing; `add_pointer<T>::type` là `const int*`. `make_signed` và `make_unsigned` yêu cầu kiểu đầu vào thỏa điều kiện, không dùng trực tiếp với reference hoặc `bool`.

Để tạo rvalue reference từ kiểu có thể đã là reference:

```cpp
typename std::add_rvalue_reference<
    typename std::remove_reference<T>::type
>::type
```

## Các trait khác

| Trait | Vai trò |
|:---|:---|
| `rank<T>`, `extent<T,I>` | Số chiều mảng và kích thước chiều `I`; trả `0` khi không xác định hoặc không có chiều đó. |
| `remove_extent<T>`, `remove_all_extents<T>` | Bỏ một hoặc mọi chiều mảng. |
| `underlying_type<T>` | Kiểu nền của enum phù hợp. |
| `decay<T>` | Biến đổi tương tự truyền theo giá trị: bỏ reference và cv cấp cao nhất, chuyển mảng/hàm sang con trỏ. |
| `enable_if<B,T>`, `conditional<B,T,F>` | Cho kiểu khi điều kiện đúng; hoặc chọn giữa hai kiểu. |
| `common_type<T...>` | Xác định kiểu chung khi có thể. |
| `result_of<F(Args...)>` | Trong giao diện C++11, xác định kiểu kết quả lời gọi. |
| `alignment_of<T>` | Độ căn chỉnh của kiểu. |
| `aligned_storage<Len,Align>`, `aligned_union<Len,Types...>` | Tạo kiểu lưu trữ với kích thước/căn chỉnh theo giao diện lịch sử. |

*Bảng 5.17, trang 131.* Ví dụ:

```cpp
std::rank<int[5][7]>::value;            // 2
std::extent<int[][7], 0>::value;        // 0: chiều đầu không biết
std::extent<int[][7], 1>::value;        // 7
// remove_extent<int[5][7]>::type là int[7]
// remove_all_extents<int[5][7]>::type là int
// decay<const int(&)[5]>::type là const int*
```

:::note Góc nhìn hiện đại
`std::result_of` bị loại trong C++20; dùng `std::invoke_result` khi phù hợp. `aligned_storage` và `aligned_union` bị khuyến cáo không dùng từ C++23. Từ C++14 có các alias như `remove_reference_t`; từ C++17 có nhiều biến `_v`, chẳng hạn `is_pointer_v<T>`.
:::
