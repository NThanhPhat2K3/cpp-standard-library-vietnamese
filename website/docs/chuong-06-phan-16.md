---
id: chuong-06-phan-16
title: 'Chương 6 · Phần tử container và xử lý lỗi'
sidebar_label: '06 · Phần 16: Phần tử và lỗi STL'
---

# 6.11–6.12.1 · Phần tử container và lỗi STL

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 244–247 (PDF trang 273–276). Các ghi chú bổ sung được đánh dấu riêng.

## 6.11.1 Yêu cầu đối với phần tử

Container và thuật toán là template nhưng không thể làm mọi thao tác với mọi kiểu. Tùy thao tác, phần tử có thể cần được xây dựng, copy, move, gán, hủy, so sánh hoặc băm. Một bản copy dùng như giá trị thường cần tương đương nguồn theo ngữ nghĩa của kiểu.

Sách liệt kê copy/move construction, assignment và destruction như các yêu cầu cơ bản; một số thao tác còn cần default construction. Tìm kiếm có thể cần `==`; ordered associative container cần comparator hợp lệ; unordered container cần hash và predicate tương đương. Những hàm thành viên đặc biệt của lớp có thể được compiler sinh ngầm, nhưng việc khai báo thành viên riêng hoặc kiểu thành viên không hỗ trợ có thể khiến chúng bị xóa hoặc không còn được sinh như mong đợi.

:::note Yêu cầu theo thao tác
Không phải mọi container hay mọi thao tác đều đòi hỏi phần tử vừa copyable vừa assignable. Chẳng hạn, nhiều tình huống dùng `std::vector<std::unique_ptr<T>>` hợp lệ dù `unique_ptr` không copy được. Kiểm tra yêu cầu cụ thể của constructor, `insert`, `resize`, thuật toán và allocator thay vì áp một danh sách chung cho mọi API.
:::

## 6.11.2 Value semantics và reference semantics

Container lưu các **đối tượng phần tử** của mình. Khi copy một giá trị vào container, đối tượng bên trong thường độc lập với đối tượng nguồn; thay đổi một bản không tự thay đổi bản kia. Container cũng có thể move hoặc dựng phần tử tại chỗ bằng `emplace`, tùy thao tác. Nhiều API như `front()`, `at()` hoặc iterator trả tham chiếu tới phần tử, không phải luôn trả bản sao như câu mô tả khái quát trong sách.

Value semantics đơn giản cho thời hạn sống, nhưng copy có thể tốn kém hoặc không khả thi, và đôi khi nhiều container cần cùng quan sát một đối tượng. Có thể lưu raw pointer, `std::shared_ptr` hoặc `std::reference_wrapper` làm **giá trị phần tử** để biểu diễn quan hệ tham chiếu:

```cpp
std::vector<std::shared_ptr<Person>> owners;
std::vector<std::reference_wrapper<Person>> observers;
```

`shared_ptr` chia sẻ quyền sở hữu; `reference_wrapper` và raw pointer không tự kéo dài thời hạn sống. So sánh pointer cũng không mặc định so sánh nội dung đối tượng. Cần xử lý thời hạn sống, sở hữu và vòng tham chiếu cho đúng; xem mục 7.11.

## 6.12.1 Xử lý lỗi

STL được thiết kế để cho phép hiệu năng cao; nhiều thao tác cơ bản không bắt buộc kiểm tra tiền điều kiện lúc chạy. Sách nêu hai lý do: kiểm tra có chi phí, và nếu cần kiểm tra có thể dùng wrapper hoặc chế độ kiểm tra của thư viện. Đổi lại, vi phạm tiền điều kiện có thể gây hành vi không xác định, không nhất thiết ném ngoại lệ.

Những điều cần kiểm tra:

- Iterator được khởi tạo và còn hiệu lực; chèn, xóa hoặc reallocation có thể làm iterator mất hiệu lực tùy container và thao tác.
- Không dereference iterator past-the-end như `end()` hoặc `rend()`.
- Phạm vi `[first,last)` hợp lệ; `last` phải đạt được từ `first` theo quy tắc của iterator.
- Với overload chỉ nhận điểm đầu của phạm vi thứ hai, phạm vi đó phải đủ dài.
- Đích ghi phải có đủ phần tử hợp lệ, hoặc dùng insert iterator phù hợp.

Các iterator tạo từ container khác nhau không tạo thành một phạm vi hợp lệ. Rehash của unordered container làm mất hiệu lực iterator theo các quy tắc liên quan; với vector/deque, cần xem chính xác thao tác và vị trí, không kết luận mọi `insert` hoặc `erase` đều làm mất hiệu lực mọi iterator.

Sách đưa ba ví dụ sai: tăng `begin()` của vector rỗng (lúc đó bằng `end()`), copy vào vector rỗng bằng `begin()`, và truyền `begin()` của một vector cùng `end()` của vector khác. Cả ba vi phạm tiền điều kiện.

```cpp
std::vector<int> src{1, 2, 3};
std::vector<int> dst;
// std::copy(src.begin(), src.end(), dst.begin()); // SAI
std::copy(src.begin(), src.end(), std::back_inserter(dst)); // đúng
```

Trong giai đoạn phát triển, chế độ kiểm tra iterator của thư viện và sanitizer có thể giúp phát hiện nhiều lỗi; sách nêu ví dụ `_GLIBCXX_DEBUG` cho libstdc++. Các công cụ này không chứng minh chương trình không có mọi hành vi không xác định, và tùy chọn debug cần được dùng nhất quán với các thành phần liên quan của chương trình.

Phần 6.12.2 tiếp tục các bảo đảm exception safety.
