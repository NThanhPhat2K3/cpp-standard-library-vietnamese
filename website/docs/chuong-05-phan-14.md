---
id: chuong-05-phan-14
title: 'Chương 5 · swap, rel_ops và ratio'
sidebar_label: '05 · Phần 14: swap, rel_ops, ratio'
---

# 5.5.2–5.6 · `swap`, so sánh và `ratio`

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 136–143 (PDF trang 165–172). Các hộp ghi chú là phần bổ sung.

## 5.5.2 Hoán đổi hai giá trị

`std::swap` trong `<utility>` hoán đổi hai đối tượng. Về ý tưởng, phiên bản tổng quát C++11 dùng move:

```cpp
template <typename T>
void illustrative_swap(T& a, T& b) {
    T tmp(std::move(a));
    a = std::move(b);
    b = std::move(tmp);
}
```

Trước C++11, cách tổng quát dùng copy/gán. Muốn dùng phiên bản tổng quát, kiểu phải đáp ứng những yêu cầu của overload; có những overload khác tối ưu cho kiểu cụ thể. Đặc tả không ném của phiên bản tổng quát trong sách phụ thuộc vào cả `is_nothrow_move_constructible<T>` và `is_nothrow_move_assignable<T>`.

Từ C++11 có overload hoán đổi hai mảng cùng kích thước theo từng phần tử; đặc tả ngoại lệ phụ thuộc phép swap phần tử. Hai đối số của overload tổng quát cần có kiểu phù hợp, nên `std::swap(i, l)` với `int` và `long` không suy luận được cùng kiểu; hai mảng có độ dài khác nhau cũng không khớp overload mảng.

Một kiểu phức tạp có thể hoán đổi các thành viên nội bộ thay vì sao chép toàn bộ dữ liệu. Ví dụ theo sách:

```cpp
class MyContainer {
    int* elems;
    int numElems;
public:
    // constructor, destructor và các thao tác khác được lược bỏ
    void swap(MyContainer& x) noexcept {
        std::swap(elems, x.elems);
        std::swap(numElems, x.numElems);
    }
};

inline void swap(MyContainer& a, MyContainer& b)
    noexcept(noexcept(a.swap(b))) {
    a.swap(b);
}
```

Đây là minh họa giao diện, không phải lớp quản lý bộ nhớ hoàn chỉnh. Một overload phù hợp có thể giúp tối ưu, như các phép swap chuyên biệt của container và string. Sách khuyên cung cấp swap riêng cho kiểu do mình viết khi có lợi ích thực tế.

:::note Góc nhìn hiện đại
Trong mã generic thường dùng `using std::swap; swap(a, b);` để cho phép ADL tìm overload trong namespace của kiểu, đồng thời có `std::swap` dự phòng. Gọi tường minh `std::swap(a,b)` không tìm một overload tự do chỉ có trong namespace của kiểu. Các container có thể có tiền điều kiện liên quan allocator; không mặc định mọi swap đều an toàn hoặc hằng số thời gian.
:::

## 5.5.3 Các toán tử so sánh bổ sung

Trong C++11, namespace `std::rel_ops` của `<utility>` cung cấp bốn function template dựa trên `==` và `<`:

```cpp
x != y  // !(x == y)
x > y   // y < x
x <= y  // !(y < x)
x >= y  // !(x < y)
```

Sau khi định nghĩa `==` và `<` cho cùng kiểu `X`, một phạm vi có `using namespace std::rel_ops;` có thể dùng các toán tử bổ sung đó. Chúng nằm trong namespace con riêng để không tự xuất hiện chỉ vì `using namespace std;`. Một số implementation từng hỗ trợ hai kiểu toán hạng khác nhau, nhưng sách lưu ý không nên dựa vào phần mở rộng không được chuẩn C++11 bảo đảm.

:::note Góc nhìn hiện đại
`std::rel_ops` đã bị khuyến cáo không dùng từ C++20. C++20 bổ sung cơ chế viết lại một số toán tử so sánh và toán tử ba chiều `<=>`; thiết kế so sánh hiện đại vẫn cần xét ý nghĩa bằng nhau và thứ tự của từng kiểu. Using-directive không thực sự đưa các khai báo thành tên toàn cục; nó ảnh hưởng tra cứu tên trong phạm vi áp dụng.
:::

## 5.6 Phân số tại thời điểm biên dịch với `std::ratio`

C++11 cung cấp `<ratio>` để biểu diễn các hằng số hữu tỉ và tính toán với chúng tại thời điểm biên dịch. `ratio` hữu ích cho đơn vị đo, đặc biệt là đơn vị thời gian của `chrono`. Việc rút gọn phân số giúp giảm nguy cơ tràn khi tính toán, dù không loại bỏ mọi giới hạn về biểu diễn.

```cpp
std::ratio<N, D> // D mặc định là 1
```

`N` và `D` có kiểu `std::intmax_t`, một kiểu số nguyên có dấu đủ biểu diễn mọi giá trị của các kiểu số nguyên có dấu chuẩn. `num` và `den` là các thành viên hằng biểu diễn phân số đã rút gọn, với mẫu số dương; `type` chỉ kiểu ratio tương ứng với dạng chuẩn hóa.

```cpp
using FiveThirds = std::ratio<5, 3>;
using AlsoFiveThirds = std::ratio<25, 15>;
using One = std::ratio<42, 42>;
using Zero = std::ratio<0>;
using Negative = std::ratio<7, -3>;
```

Các cặp `num/den` lần lượt là `5/3`, `5/3`, `1/1`, `0/1`, `-7/3`. Hai kiểu `ratio<5,3>` và `ratio<25,15>` vẫn là hai specialization được viết khác nhau; so sánh **giá trị** bằng `ratio_equal` hoặc xét kiểu `::type` đã chuẩn hóa.

### Phép toán và so sánh

| Trait trong `<ratio>` | Tác dụng |
|:---|:---|
| `ratio_add<R1,R2>` | Tổng hai ratio, đã rút gọn. |
| `ratio_subtract<R1,R2>` | Hiệu. |
| `ratio_multiply<R1,R2>` | Tích. |
| `ratio_divide<R1,R2>` | Thương. |
| `ratio_equal`, `ratio_not_equal` | So sánh bằng hoặc khác. |
| `ratio_less`, `ratio_less_equal` | So sánh nhỏ hơn hoặc nhỏ hơn/bằng. |
| `ratio_greater`, `ratio_greater_equal` | So sánh lớn hơn hoặc lớn hơn/bằng. |

*Bảng 5.19, trang 141.* Kết quả số học là ratio; các trait so sánh có `::value` boolean:

```cpp
using Sum = std::ratio_add<std::ratio<2, 7>, std::ratio<2, 6>>::type;
static_assert(Sum::num == 13 && Sum::den == 21, "2/7 + 2/6");
static_assert(std::ratio_equal<std::ratio<5, 3>,
                               std::ratio<25, 15>>::value, "bang nhau");
```

Mẫu số bằng không, phép chia cho ratio bằng không hoặc kết quả không biểu diễn được trong các giới hạn yêu cầu khiến chương trình không hợp lệ khi specialization tương ứng được khởi tạo. Sách lưu ý rằng chỉ viết tên specialization trong một ngữ cảnh không yêu cầu định nghĩa đầy đủ có thể chưa kích hoạt kiểm tra; không nên dựa vào một thời điểm báo lỗi cụ thể.

### Các ratio định nghĩa sẵn

| Tên | Hệ số | Tên | Hệ số |
|:---|---:|:---|---:|
| `yocto`* | 10⁻²⁴ | `zepto`* | 10⁻²¹ |
| `atto` | 10⁻¹⁸ | `femto` | 10⁻¹⁵ |
| `pico` | 10⁻¹² | `nano` | 10⁻⁹ |
| `micro` | 10⁻⁶ | `milli` | 10⁻³ |
| `centi` | 10⁻² | `deci` | 10⁻¹ |
| `deca` | 10¹ | `hecto` | 10² |
| `kilo` | 10³ | `mega` | 10⁶ |
| `giga` | 10⁹ | `tera` | 10¹² |
| `peta` | 10¹⁵ | `exa` | 10¹⁸ |
| `zetta`* | 10²¹ | `yotta`* | 10²⁴ |

*Bảng 5.20 của sách, trang 142; dấu `*` chỉ các tên tùy chọn khi giá trị biểu diễn được bởi `intmax_t` trong bối cảnh sách.* Ví dụ `std::nano` tương đương `std::ratio<1, 1000000000>` và thuận tiện để biểu diễn nanosecond.

:::note Góc nhìn hiện đại
Các tên trong bảng phản ánh ấn bản C++11 của sách; các phiên bản C++ sau có thể bổ sung tiền tố SI khác khi implementation biểu diễn được. `std::ratio` biểu diễn **hằng số hữu tỉ lúc biên dịch**, không phải kiểu số thực chạy thời gian thực.
:::
