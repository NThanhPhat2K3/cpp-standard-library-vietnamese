---
id: chuong-05-phan-9
title: 'Chương 5 · auto_ptr và tổng kết smart pointer'
sidebar_label: '05 · Phần 9: Tổng kết smart pointer'
---

# 5.2.7–5.2.8 · `auto_ptr` và tổng kết smart pointer

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 113–114 (PDF trang 142–143). Ghi chú hiện đại được đánh dấu riêng.

## 5.2.7 `auto_ptr`: kiến thức lịch sử

C++98 chỉ cung cấp một smart pointer chuẩn là `std::auto_ptr`. Nó có mục tiêu quản lý quyền sở hữu mà `unique_ptr` đảm nhận về sau, nhưng gặp những vấn đề:

- Khi thiết kế `auto_ptr`, ngôn ngữ chưa có move constructor và move assignment. Để chuyển quyền sở hữu, thao tác trông như copy lại **chuyển** quyền sở hữu khỏi nguồn. Điều này dễ gây ngạc nhiên khi truyền đối số.
- Nó không có cơ chế deleter tùy chỉnh và được dùng cho một đối tượng đơn được tạo bằng `new`, không phải mảng hoặc tài nguyên cần chính sách giải phóng khác.
- Vì là smart pointer chuẩn duy nhất lúc đầu, nó đôi khi bị hiểu nhầm là có quyền sở hữu chung giống `shared_ptr`.

Ví dụ lịch sử sau **cố ý sai**, không dùng trong chương trình mới:

```cpp
template <typename T>
void bad_print(std::auto_ptr<T> p) { // nhận quyền sở hữu
    if (p.get() == NULL) std::cout << "NULL";
    else std::cout << *p;
} // p bị hủy, đối tượng được xóa

std::auto_ptr<int> p(new int);
*p = 42;
bad_print(p); // chuyển quyền sở hữu; p không còn sở hữu đối tượng
*p = 18;      // SAI: dereference con trỏ rỗng
```

Truyền theo giá trị làm đối số `p` của hàm nhận quyền sở hữu rồi xóa đối tượng khi hàm kết thúc. Đây có thể không phải điều người gọi dự định; cách dùng với container cũng dễ gây nhầm lẫn. `unique_ptr` không cho copy kiểu này: việc chuyển từ biến có tên phải thể hiện bằng move phù hợp, chẳng hạn `std::move`.

:::note Góc nhìn hiện đại
`std::auto_ptr` bị khuyến cáo không dùng từ C++11 và bị loại khỏi tiêu chuẩn từ C++17. Chỉ nên biết về nó để đọc hoặc chuyển đổi mã cũ; dùng `unique_ptr`, `shared_ptr` hoặc đối tượng giá trị theo mô hình sở hữu thực tế.
:::

## 5.2.8 Tổng kết smart pointer

C++11 cung cấp hai mô hình chính:

- `shared_ptr`: nhiều chủ sở hữu cùng giữ thời hạn sống của đối tượng.
- `unique_ptr`: một chủ sở hữu, có thể chuyển quyền sở hữu; thay thế mục đích sử dụng cũ của `auto_ptr`.

### Hiệu năng và biểu diễn

Sách giải thích rằng `shared_ptr` thường dùng thiết kế không xâm lấn: đối tượng được quản lý không cần kế thừa một lớp cơ sở đặc biệt, nên có thể áp dụng cả với kiểu cơ bản. Đổi lại, implementation thường cần con trỏ được lưu cùng dữ liệu quản lý chung như control block và các số đếm sở hữu mạnh/yếu. Control block cần tồn tại đủ lâu để weak pointer còn có thể quan sát trạng thái sau khi đối tượng bị hủy.

`unique_ptr` không cần đếm chủ sở hữu chung; cơ chế dựa trên destructor, constructor/assignment move và việc vô hiệu hóa copy. Với deleter rỗng, implementation thường có thể lưu nó mà không tăng kích thước so với con trỏ; function object hoặc lambda không trạng thái cũng có thể giúp trình biên dịch tối ưu lời gọi deleter.

:::note Góc nhìn hiện đại
Đây là đặc điểm triển khai và kỳ vọng hiệu năng, không phải bảo đảm rằng `sizeof(unique_ptr<T>) == sizeof(T*)` hay mọi thao tác đều không có overhead trên mọi hệ thống. Deleter có trạng thái, loại con trỏ tùy chỉnh, cấp phát và đồng bộ đều có thể ảnh hưởng chi phí; đo trên ứng dụng và implementation mục tiêu khi cần.
:::

### Những điều vẫn cần quản lý

Smart pointer không tự giải quyết mọi vấn đề về thời hạn sống. Tránh tạo nhiều **chủ sở hữu độc lập** từ cùng raw pointer; chọn deleter khớp tài nguyên; dùng `weak_ptr` khi cần phá vòng sở hữu. Sách dẫn mục 7.11 cho ví dụ dùng shared pointer trong nhiều container.

Cách quản lý mảng và deleter của `shared_ptr` và `unique_ptr` khác nhau. Bản sách mô tả C++11; từ C++17 `shared_ptr<T[]>` cũng hỗ trợ mảng. Về đa luồng, cần phân biệt các biến smart pointer, control block và đối tượng được trỏ tới; xem mục 5.2.4 đã dịch.

## 5.3 Giới hạn số: giới thiệu

Các kiểu số có giới hạn phụ thuộc nền tảng. Template `std::numeric_limits` trong `<limits>` cung cấp giao diện có kiểu để tra cứu các giới hạn đó và cho phép mã template hỏi đặc tính của kiểu. Nó bổ sung cho các macro C vẫn có trong `<climits>`/`<limits.h>` đối với số nguyên và `<cfloat>`/`<float.h>` đối với số dấu phẩy động.

Sách trình bày một bảng kích thước tối thiểu mang tính quy ước theo **octet 8 bit**: `char` 1, `short` và `int` 2, `long` và `float` 4, `long long`, `double` và `long double` 8 octet. Chú thích của tác giả lưu ý rằng “byte” C++ không nhất thiết là 8 bit; ví dụ một byte có thể có ít nhất 32 bit. Vì vậy, không nên dùng bảng như bảo đảm tổng quát về `sizeof` hay về kích thước của mọi kiểu dấu phẩy động.

:::warning Cách dùng bảng kích thước
Các giới hạn chuẩn nên được xét theo **miền giá trị và độ chính xác được bảo đảm**, không suy luận trực tiếp rằng mọi `float` có ít nhất 32 bit hay mọi `double` có ít nhất 64 bit chỉ từ bảng trong sách. `sizeof(char)` luôn là 1 theo đơn vị byte C++, còn số bit mỗi byte được cho bởi `CHAR_BIT` và ít nhất là 8.
:::

Phần còn lại của mục 5.3 — các thành viên, bảng tra cứu và ví dụ của `numeric_limits` — sẽ được dịch ở trang tiếp theo.
