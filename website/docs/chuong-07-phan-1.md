---
id: chuong-07-phan-1
title: 'Chương 7 · Khả năng và thao tác chung của container'
sidebar_label: '07 · Phần 1: Khả năng và thao tác chung'
---

# Chương 7 · Các container STL

> **Phạm vi:** Phần mở đầu và mục 7.1.1–7.1.3. Các loại container cụ thể sẽ tiếp tục ở những trang sau.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 253–260 (PDF trang 282–289). Các hộp ghi chú là phần bổ sung.

Chương này tiếp nối Chương 6, đi sâu vào cấu trúc thường dùng, thao tác, hiệu năng và ví dụ của từng container; sau đó so sánh ưu nhược điểm để lựa chọn. Chương 8 bổ sung bảng tra cứu các member và kiểu. Adapter (`stack`, `queue`, `priority_queue`) và `bitset` được trình bày ở Chương 12; giao diện STL của string ở mục 13.2.14; `valarray` ở mục 17.4.

## 7.1.1 Các khả năng chung

Sách nêu ba ý chính:

1. Container lưu các **đối tượng phần tử**. Chúng có thể được copy, move hoặc dựng tại chỗ; để nhiều nơi cùng truy cập một đối tượng, có thể lưu smart pointer hoặc reference wrapper với mô hình thời hạn sống phù hợp.
2. Container cung cấp iterator để duyệt theo một thứ tự. Với unordered container, thứ tự duyệt không phải thứ tự sắp xếp theo khóa và có thể thay đổi khi rehash hoặc sửa container.
3. Nhiều thao tác không bắt buộc kiểm tra mọi tiền điều kiện. Iterator, chỉ số hoặc phạm vi không hợp lệ có thể dẫn tới hành vi không xác định.

Các lỗi cấp phát hoặc thao tác của kiểu do người dùng cung cấp vẫn có thể phát sinh ngoại lệ; bảo đảm exception safety phụ thuộc API và điều kiện cụ thể.

## 7.1.2 Các thao tác chung

Bảng 7.1–7.2 trong sách liệt kê giao diện thường gặp. Không phải mọi container có mọi thao tác: `array` có kích thước cố định; `forward_list` không có `size()`; unordered container không có so sánh thứ tự như container có thứ tự.

| Thao tác | Ý nghĩa và giới hạn |
|:---|:---|
| `C c` | Default construct; phần lớn container rỗng, `array<T,N>` có `N` phần tử. |
| `C c(other)`, `C c = other` | Copy construct khi kiểu và thao tác phù hợp. |
| `C c(std::move(other))` | Move construct khi được hỗ trợ; semantics và chi phí tùy loại/allocator. |
| `C c(first,last)` | Khởi tạo từ phạm vi với container hỗ trợ range constructor; không phải constructor của `array`. |
| `C c{...}` | Khởi tạo từ giá trị theo quy tắc của container và list-initialization. |
| `c = other`, `c = std::move(other)` | Copy hoặc move assignment khi được hỗ trợ. |
| `c = { ... }` | Gán từ initializer list với các container hỗ trợ. |
| `empty()`, `size()`, `max_size()` | Kiểm tra rỗng, kích thước hiện tại, giới hạn lý thuyết của container. |
| `begin()`, `end()`, `cbegin()`, `cend()` | Lấy biên phạm vi đọc/ghi hoặc chỉ đọc. |
| `clear()` | Xóa mọi phần tử ở container hỗ trợ; không có ở `array`. |
| `swap(c1,c2)`, `c1.swap(c2)` | Hoán đổi nội dung theo hợp đồng và điều kiện allocator của container. |
| `==`, `!=`, và các phép thứ tự | So sánh khi overload tương ứng được cung cấp và kiểu phần tử thỏa yêu cầu. |

*Bảng 7.1–7.2, trang 255–256, chuyển ngữ và nhóm lại.* `array` vẫn có copy/move của các phần tử khi các thao tác đó hợp lệ; khác biệt là nó không thể chuyển một vùng lưu trữ động nguyên khối như một số container khác.

### Khởi tạo từ giá trị và phạm vi

```cpp
const std::vector<int> v{1, 2, 3, 5, 7, 11, 13, 17, 21};
std::unordered_set<std::string> words{"hello", std::string(), ""};
```

`words` chỉ có một chuỗi rỗng vì set không lưu hai khóa tương đương. Một range constructor có thể nhận iterator của container khác nếu phần tử đích được khởi tạo phù hợp:

```cpp
std::list<int> input{1, 2, 3};
std::vector<float> floats(input.begin(), input.end());

int values[] = {2, 3, 17, 33, 45, 77};
std::set<int> ordered(std::begin(values), std::end(values));
```

`std::begin`/`std::end` cho mảng có trong `<iterator>` từ C++11. Move iterator cho phép khởi tạo từ các phần tử nguồn bằng move khi constructor tương ứng được chọn:

```cpp
std::list<std::string> names{"An", "Binh"};
std::vector<std::string> moved(std::make_move_iterator(names.begin()),
                               std::make_move_iterator(names.end()));
```

List vẫn có các node; trạng thái từng string nguồn sau move không nên bị giả định.

Có thể đọc từ stream iterator:

```cpp
std::deque<int> data{std::istream_iterator<int>(std::cin),
                     std::istream_iterator<int>()};
```

Sách giải thích cách viết bằng ngoặc tròn có thể bị phân tích như **khai báo hàm** (*most vexing parse*), thay vì tạo biến; thêm ngoặc quanh đối số đầu hoặc dùng cú pháp khác để tránh. Ngoặc nhọn không phải lúc nào cũng đồng nghĩa ngoặc tròn: nếu constructor `initializer_list` phù hợp, nó có thể được ưu tiên.

### Move, assignment và swap

Copy assignment thường phải xử lý các phần tử cũ và mới. Move có thể tránh sao chép từng phần tử trong nhiều trường hợp:

```cpp
std::vector<int> v1{1, 2, 3};
std::vector<int> v2 = std::move(v1);
```

Đối tượng nguồn sau move vẫn hợp lệ theo hợp đồng áp dụng nhưng nội dung không được giả định. Không mặc định mọi move assignment là hoán đổi con trỏ hay có độ phức tạp hằng: allocator không tương thích có thể yêu cầu di chuyển từng phần tử; `std::array` chứa phần tử trực tiếp.

`swap` của nhiều container động trao đổi trạng thái quản lý hiệu quả; iterator/tham chiếu tới phần tử thường tiếp tục chỉ tới phần tử đó nhưng giờ thuộc container kia, với các ngoại lệ và điều kiện cụ thể, đặc biệt allocator và past-the-end iterator. `array::swap` hoán đổi từng phần tử, có độ phức tạp tuyến tính; iterator vẫn gắn với vị trí trong array ban đầu.

### Kích thước, so sánh và duyệt

`empty()` kiểm tra rỗng và dùng được với `forward_list`, trong khi `size()` không có ở loại này. `max_size()` là giới hạn do implementation và allocator quy định, không hứa bộ nhớ thực tế đủ để đạt tới nó.

Trong bối cảnh C++11 của sách, container có thứ tự hỗ trợ so sánh bằng và thứ tự từ điển khi các phép so sánh phần tử phù hợp. Unordered container có so sánh bằng/khác nhưng không cung cấp thứ tự từ điển; cần xét quy tắc tương đương và điều kiện của từng kiểu. Các container khác kiểu thường cần thuật toán so sánh phạm vi thích hợp.

Duyệt chỉ đọc có thể dùng `for (const auto& elem : coll)` hoặc `cbegin()`/`cend()`. Duyệt sửa được có thể dùng `auto&` hoặc iterator không const, **nếu phần tử có thể sửa**; khóa của set/map không được sửa trực tiếp. Quy tắc invalidation khác nhau: reallocation vector làm mất hiệu lực iterator; unordered rehash làm mất hiệu lực iterator nhưng thường giữ tham chiếu đến phần tử; cần kiểm tra từng thao tác.

## 7.1.3 Các tên kiểu chung

| Tên kiểu | Ý nghĩa |
|:---|:---|
| `size_type` | Kiểu số nguyên không dấu cho kích thước. |
| `difference_type` | Kiểu số nguyên có dấu cho độ chênh lệch. |
| `value_type` | Kiểu phần tử. |
| `reference`, `const_reference` | Kiểu tham chiếu phần tử có thể sửa/chỉ đọc theo giao diện container. |
| `iterator`, `const_iterator` | Kiểu iterator và iterator chỉ đọc. |
| `pointer`, `const_pointer` | Kiểu con trỏ tương ứng khi container cung cấp. |

*Bảng 7.3, trang 260.* Một số container hoặc specialization dùng proxy reference, nên không nên mặc định `reference` luôn chính xác là `value_type&`.
