---
id: chuong-07-phan-4
title: 'Chương 7 · Các thao tác vector'
sidebar_label: '07 · Phần 4: Các thao tác vector'
---

# 7.3.2–7.3.3 · Thao tác `std::vector`

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 272–278 (PDF trang 301–307). Các hộp ghi chú là phần bổ sung.

## Tạo và gán

| Thao tác | Ý nghĩa |
|:---|:---|
| `vector<T> v` | Vector rỗng. |
| `vector<T> v(n)` | Tạo `n` phần tử được khởi tạo theo overload; với `int` thông thường là zero. |
| `vector<T> v(n, value)` | Tạo `n` bản sao của `value`. |
| `vector<T> v(first,last)` | Tạo từ phạm vi. |
| `vector<T> v{...}` | Khởi tạo từ initializer list phù hợp. |
| Copy/move constructor, assignment | Sao chép hoặc chuyển nội dung theo điều kiện của kiểu và allocator. |
| `v.assign(n,value)`, `v.assign(first,last)`, `v.assign({...})` | Thay nội dung bằng các phần tử từ nguồn tương ứng. |
| `v.swap(other)`, `swap(v,other)` | Hoán đổi trạng thái theo điều kiện allocator. |

*Bảng 7.9 và 7.11, trang 272–274.* Dấu ngoặc có ý nghĩa khác nhau: `std::vector<int> a(5)` có năm số zero, còn `std::vector<int> b{5}` có một phần tử bằng 5.

## Kích thước và truy cập

`empty`, `size`, `max_size`, `capacity`, `reserve` và `shrink_to_fit` đã được giới thiệu ở trang trước. `reserve` và `shrink_to_fit` không thay nội dung logic nhưng có thể cấp phát lại và làm iterator mất hiệu lực.

| Thao tác | Hợp đồng truy cập |
|:---|:---|
| `v[i]` | Truy cập chỉ số hợp lệ, không dựa vào kiểm tra giới hạn. |
| `v.at(i)` | Kiểm tra và ném `std::out_of_range` nếu ngoài khoảng. |
| `v.front()`, `v.back()` | Truy cập đầu/cuối; vector phải không rỗng. |
| `v.data()` | Con trỏ tới vùng phần tử liên tục đối với vector thông thường. |

*Bảng 7.10 và 7.12, trang 273–274.* Kiểm tra `size()` hoặc `empty()` rồi truy cập chỉ an toàn khi không có data race hoặc sửa đổi xen giữa; cần đồng bộ trong chương trình đa luồng.

`begin/end`, `cbegin/cend`, `rbegin/rend`, `crbegin/crend` cung cấp các iterator xuôi/ngược như Bảng 7.13. Iterator vector là random access, nhưng kiểu chính xác không nhất thiết là raw pointer.

## Chèn và xóa

| Thao tác | Ý nghĩa |
|:---|:---|
| `push_back(value)` | Thêm một phần tử ở cuối bằng copy hoặc move phù hợp. |
| `emplace_back(args...)` | Dựng phần tử cuối từ đối số. |
| `pop_back()` | Hủy phần tử cuối; yêu cầu không rỗng. |
| `insert(pos,value)` | Chèn trước `pos`; trả iterator tới phần tử chèn. |
| `insert(pos,n,value)` | Chèn `n` bản sao. |
| `insert(pos,first,last)` | Chèn các phần tử từ phạm vi phù hợp. |
| `insert(pos,{...})` | Chèn initializer list. |
| `emplace(pos,args...)` | Dựng phần tử tại vị trí thích hợp. |
| `erase(pos)`, `erase(first,last)` | Xóa phần tử hoặc phạm vi và trả iterator tiếp theo. |
| `resize(n)`, `resize(n,value)` | Thay kích thước; nếu tăng, tạo phần tử mới. |
| `clear()` | Hủy tất cả phần tử; capacity không nhất thiết giảm. |

*Bảng 7.14, trang 277.* `emplace` chuyển đối số đến constructor để dựng phần tử; không nên hiểu như sách ghi rằng nó nhất thiết “chèn một bản sao”. `emplace_back` trả `void` trong C++11 và trả tham chiếu tới phần tử từ C++17.

Khi chèn không gây reallocation, iterator/tham chiếu **trước** vị trí chèn còn hợp lệ; tại hoặc sau vị trí đó, bao gồm `end` cũ, mất hiệu lực. Nếu reallocation xảy ra, tất cả iterator, con trỏ và tham chiếu tới phần tử mất hiệu lực. Khi erase, iterator và tham chiếu tại hoặc sau vị trí xóa mất hiệu lực. Xem hợp đồng overload và phiên bản mục tiêu cho các chi tiết khác.

Xóa tất cả phần tử bằng một giá trị theo idiom erase–remove:

```cpp
v.erase(std::remove(v.begin(), v.end(), value), v.end());
```

Xóa lần xuất hiện đầu:

```cpp
auto pos = std::find(v.begin(), v.end(), value);
if (pos != v.end()) v.erase(pos);
```

Từ C++20 có thể dùng `std::erase(v, value)` để xóa tất cả phần tử phù hợp. Chèn/xóa ở cuối thường rẻ hơn ở đầu hoặc giữa; chèn nhiều giá trị bằng một lời gọi có thể giảm số lần dịch phần tử.

## 7.3.3 Dùng vector với API kiểu C

Với `std::vector<T>` thông thường (`T` không phải `bool`), các phần tử nằm liên tục. Dùng `data()` và `size()` để truyền vùng phần tử đang tồn tại:

```cpp
std::vector<char> buf(41);
std::strcpy(buf.data(), "hello, world"); // vừa cả ký tự kết thúc
std::printf("%s\n", buf.data());
```

Cần `<cstring>` và `<cstdio>`, đủ chỗ và bảo đảm chuỗi có `\0`. `reserve(41)` thay cho `vector<char>(41)` không tạo 41 phần tử để ghi. Không dùng `&v[0]` khi vector rỗng; `data()` có thể được gọi khi rỗng nhưng không được dereference nếu không có phần tử. Iterator không nhất thiết là `T*`, vì vậy không truyền `begin()` cho API yêu cầu raw pointer.

:::note Đính chính ví dụ gốc
Sách in `std::vector<char,41> v` trong ví dụ `data()`, nhưng tham số template thứ hai của vector là **kiểu allocator**, không phải kích thước. Cách đúng để tạo 41 phần tử là `std::vector<char> v(41)`.
:::
