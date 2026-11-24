---
id: chuong-03-phan-2
title: 'Chương 3 · Move semantics và rvalue reference'
sidebar_label: '03 · Phần 2: Move semantics'
---

# 3.1.5 · Move semantics và rvalue reference

> **Phạm vi:** Mục 3.1.5 của sách; Chương 3 vẫn đang được dịch.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 19–23 (trang PDF 48–52). Các hộp “Góc nhìn hiện đại” là phần bổ sung hoặc đính chính.

**Move semantics** — ngữ nghĩa di chuyển — là một trong những tính năng quan trọng của C++11. Nó tiếp tục mục tiêu thiết kế lớn của C++: tránh những bản sao và đối tượng tạm không cần thiết. Đây là một chủ đề phức tạp; tác giả khuyên đọc thêm tài liệu chuyên sâu và chỉ giới thiệu, tóm tắt ngắn gọn ở đây. Chú thích trong sách ghi nhận các tài liệu của Dave Abrahams, Thomas Becker và trao đổi với Daniel Krügler, Dietmar Kühl, Jens Maurer.

## Tại sao cần move?

Xét đoạn mã sau, trong đó `X` là một kiểu đối tượng và `coll` là một tập hợp:

```cpp
void createAndInsert(std::set<X>& coll) {
    X x; // tạo đối tượng X
    // ...
    coll.insert(x); // chèn vào tập hợp
}
```

Ở cách chèn bằng tham chiếu hằng, tập hợp tạo một bản sao bên trong:

```cpp
// Minh họa chữ ký, không phải định nghĩa đầy đủ của std::set
insert(const T& value); // sao chép value
```

Điều này hữu ích vì container có **value semantics**: phần tử được lưu là một giá trị riêng. Ta có thể chèn một đối tượng tạm, hoặc tiếp tục sử dụng và sửa đối tượng ban đầu sau khi chèn:

```cpp
X x;
coll.insert(x);     // chèn bản sao của x
// ...
coll.insert(x + x); // trong cách tiếp cận chỉ sao chép: sao chép giá trị tạm
// ...
coll.insert(x);     // sao chép x, dù sau đó không còn dùng x
```

Ở hai lần chèn cuối, nếu giá trị tạm và `x` không còn được bên gọi cần tới, sẽ hữu ích nếu container có thể **di chuyển** nội dung của chúng thay vì tạo bản sao. Khi sao chép tốn kém — chẳng hạn `X` quản lý một tập hợp chuỗi lớn — điều này có thể cải thiện hiệu năng đáng kể.

Từ C++11, ta có thể yêu cầu cách xử lý đó. Với đối tượng tạm, ngôn ngữ có thể chọn thao tác move; với một biến có tên, lập trình viên thường phải chỉ rõ rằng có thể chuyển tài nguyên đi:

```cpp
X x;
coll.insert(x);            // sao chép; x vẫn còn được sử dụng
// ...
coll.insert(x + x);        // di chuyển hoặc sao chép giá trị tạm
// ...
coll.insert(std::move(x)); // cho phép di chuyển hoặc sao chép từ x
```

`std::move`, khai báo trong `<utility>`, **không tự di chuyển dữ liệu**. Nó chuyển biểu thức đối số thành biểu thức rvalue, nhờ đó có thể chọn một overload nhận *rvalue reference*, chẳng hạn `X&&`. Khi lập trình viên dùng `std::move(x)`, họ thường biểu thị rằng không còn cần giữ nguyên giá trị của `x` và cho phép thao tác được gọi lấy tài nguyên của nó.

:::note Góc nhìn hiện đại
Mô tả “rvalue là đối tượng tạm vô danh chỉ xuất hiện ở bên phải phép gán” trong sách là cách hình dung đơn giản hóa, không phải định nghĩa đầy đủ. Giá trị biểu thức C++ có các nhóm như lvalue, xvalue và prvalue; kết quả `std::move(x)` là một **xvalue**. Bản thân `std::move` không đảm bảo có move: việc gì xảy ra phụ thuộc overload và kiểu đối tượng.
:::

## Move constructor và trạng thái sau move

Container có thể cung cấp hai overload để phân biệt trường hợp sao chép và di chuyển:

```cpp
// Minh họa chữ ký
insert(const T& value); // nhận lvalue, thường sao chép
insert(T&& value);      // nhận rvalue, có thể di chuyển
```

Overload nhận rvalue reference có thể tận dụng nội dung của đối tượng nguồn để khởi tạo phần tử mới. Nhưng nó cần sự hợp tác của kiểu phần tử vì chỉ kiểu đó biết cách quản lý các thành viên nội bộ. Một lớp có thể cung cấp cả copy constructor và move constructor:

```cpp
class X {
public:
    X(const X& source); // copy constructor
    X(X&& source);      // move constructor
    // ...
};
```

Ví dụ, một move constructor của chuỗi hoặc tập hợp **có thể** chuyển quyền quản lý vùng nhớ bên trong, thay vì cấp phát mới rồi sao chép từng phần tử. Cách triển khai cụ thể phụ thuộc vào kiểu và hoàn cảnh. Nếu không có move constructor phù hợp, copy constructor có thể được dùng khi có thể nhận đối số đó.

Khi chuyển tài nguyên, người triển khai phải bảo đảm việc sửa hoặc hủy đối tượng nguồn không làm hỏng đối tượng mới. Một cách thường dùng là đặt con trỏ tài nguyên trong nguồn về `nullptr` sau khi chuyển quyền sở hữu. Move semantics không bắt buộc đối tượng nguồn phải rỗng, nhưng việc giữ một trạng thái hợp lệ sau move là cần thiết cho các thao tác được phép tiếp theo.

Sách nêu rằng các đối tượng thư viện chuẩn sau move nói chung ở trạng thái **hợp lệ nhưng không xác định cụ thể** (*valid but unspecified*): có thể gán giá trị mới, nhưng không nên dự đoán giá trị hiện tại. Sách còn nói các container nguồn sẽ rỗng; không nên áp dụng phát biểu đó như một đảm bảo chung — xem đính chính sau.

:::warning Đính chính quan trọng
Không giả định mọi container hoặc chuỗi đều rỗng sau move. Với nhiều kiểu thư viện chuẩn, hợp đồng chung là trạng thái hợp lệ nhưng không xác định cụ thể, trừ khi phép toán có bảo đảm riêng. Kiểm tra tiền điều kiện của thao tác tiếp theo; có thể hủy hoặc gán lại đối tượng, nhưng không được tùy tiện giả định nó còn phần tử hay đang rỗng. Ngoài ra, một số trường hợp như chuỗi tối ưu kích thước nhỏ hoặc khác allocator không đơn giản là chuyển một con trỏ.
:::

Tương tự, một lớp có thể cung cấp cả copy assignment và move assignment:

```cpp
class X {
public:
    X& operator=(const X& source); // copy assignment
    X& operator=(X&& source);      // move assignment
    // ...
};
```

Với chuỗi hoặc tập hợp, một cách thực hiện có thể trao đổi nội dung và tài nguyên bên trong. Tác giả lưu ý rằng đối tượng đích trước phép gán có thể đang giữ tài nguyên như khóa; giải phóng tài nguyên cũ sớm có thể quan trọng. Ngữ nghĩa move tự nó không yêu cầu một chiến lược giải phóng cụ thể.

## Quy tắc chọn overload

Các ví dụ sau giả sử `X&&` là rvalue reference thông thường, không phải forwarding reference được suy luận từ template:

| Các overload có sẵn | Có thể gọi với | Ý nghĩa |
|:---|:---|:---|
| `foo(X&)` | Lvalue không hằng phù hợp | Không nhận rvalue. |
| `foo(const X&)` | Lvalue và rvalue phù hợp | Có thể đọc qua tham chiếu hằng. |
| `foo(X&)` và `foo(X&&)` | Lvalue không hằng hoặc rvalue | Có thể xử lý hai trường hợp khác nhau. |
| `foo(const X&)` và `foo(X&&)` | Lvalue hoặc rvalue phù hợp | Overload rvalue có thể chuyển tài nguyên. |
| Chỉ `foo(X&&)` | Rvalue phù hợp | Một lvalue thông thường không gọi trực tiếp được. |

Trong trường hợp có overload rvalue, nó được phép áp dụng move semantics và lấy trạng thái hoặc tài nguyên của đối số. Sách nêu các kiểu chỉ hỗ trợ move như unique pointer, file stream và string stream là những ứng dụng quan trọng.

Nếu một lớp không có move operation khả dụng nhưng copy operation nhận `const X&` có thể dùng được, một rvalue vẫn có thể được **sao chép**. Vì vậy, `std::move` không có nghĩa chắc chắn rằng dữ liệu đã được di chuyển.

:::note Góc nhìn hiện đại
Một move constructor bị khai báo `= delete` hoặc không truy cập được có thể được chọn trong quá trình chọn overload và gây lỗi; không phải mọi trường hợp “không move được” đều tự động rơi về copy. `const` trên đối tượng nguồn cũng ảnh hưởng đến overload được chọn.
:::

## Trả về giá trị và rvalue reference

Xét hàm trả về đối tượng theo giá trị:

```cpp
X foo() {
    X x;
    // ...
    return x;
}
```

Theo thứ tự trình bày trong sách về C++11:

1. Trình biên dịch có thể bỏ qua việc sao chép hoặc di chuyển, bằng tối ưu giá trị trả về có tên (**NRVO**), khi các điều kiện ngôn ngữ cho phép.
2. Nếu không bỏ qua và move constructor phù hợp, đối tượng có thể được di chuyển.
3. Nếu không move được nhưng copy constructor phù hợp, đối tượng có thể được sao chép.
4. Nếu không có cách khởi tạo hợp lệ, chương trình không biên dịch.

Với trường hợp trả về biến cục bộ như trên, thường nên viết `return x;`, không thêm `std::move(x)`: việc thêm `std::move` có thể ngăn NRVO. Việc bỏ qua copy khi trả về giá trị đã có từ trước C++11 và được nhiều trình biên dịch hỗ trợ.

:::note Góc nhìn hiện đại
Từ C++17, một số trường hợp trả về **prvalue** được khởi tạo trực tiếp theo quy tắc ngôn ngữ; điều này khác với NRVO dành cho biến cục bộ có tên, vốn vẫn không bắt buộc. Quy tắc chọn move khi trả về còn thay đổi theo phiên bản, nên kiểm tra tiêu chuẩn mục tiêu khi gặp trường hợp phức tạp.
:::

Không trả về tham chiếu đến một đối tượng cục bộ không phải `static`:

```cpp
X&& foo() {
    X x;
    // ...
    return std::move(x); // NGUY HIỂM: tham chiếu sẽ bị treo
}
```

`X&&` vẫn là một tham chiếu. Đối tượng `x` bị hủy khi hàm kết thúc; dùng tham chiếu trả về sau đó là hành vi không xác định. `std::move` không kéo dài thời hạn sống của `x`. Sách cũng minh họa bằng `return x;`; tùy phiên bản ngôn ngữ, dòng đó có thể bị từ chối khi biên dịch hoặc dẫn tới tham chiếu bị treo, nhưng không an toàn để dùng làm cách trả về.
