---
id: chuong-08-phan-1
title: 'Chương 8 · Kiểu thành viên và constructor'
sidebar_label: '08 · Phần 1: Kiểu thành viên và constructor'
---

# 8.1–8.2 · Kiểu thành viên và khởi tạo container

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 397–402 (PDF trang 426–431). Chương này tra cứu chi tiết thành viên của container và `string`; cách hỗ trợ overload cụ thể có thể thay đổi theo chuẩn.

## 8.1 Kiểu định nghĩa bên trong container

Các kiểu thành viên cho phép viết mã tổng quát mà không phải giả định kiểu biểu diễn chính xác của từng implementation.

| Kiểu | Ý nghĩa | Nhóm hỗ trợ / lưu ý |
|:---|:---|:---|
| `value_type` | Kiểu phần tử. | Với map và unordered map, là `pair<const Key, T>`; với set, là kiểu khóa `Key`. |
| `reference`, `const_reference` | Kiểu tham chiếu phần tử và tham chiếu hằng. | Thường tương ứng tham chiếu tới `value_type`; `vector<bool>` dùng proxy cho `reference` và `bool` cho `const_reference`. |
| `iterator`, `const_iterator` | Iterator và iterator chỉ đọc. | Mọi nhóm được sách liệt kê hỗ trợ; khả năng duyệt phụ thuộc từng container. |
| `reverse_iterator`, `const_reverse_iterator` | Iterator đảo chiều. | Có ở `array`, `vector`, `deque`, `list`, các associative container có thứ tự và `string`; không có trong `forward_list` và unordered container. |
| `pointer`, `const_pointer` | Kiểu con trỏ tới phần tử / phần tử hằng. | Không nên giả định mọi allocator và chuyên biệt đều biểu diễn giống raw pointer. |
| `size_type` | Kiểu số nguyên không dấu dùng cho kích thước. | Có trong các nhóm container sách liệt kê, dù `forward_list` không có hàm `size()`. |
| `difference_type` | Kiểu số nguyên có dấu cho hiệu giữa các iterator theo các thao tác hợp lệ. | Có trong các nhóm container sách liệt kê. |
| `key_type` | Kiểu khóa. | Các associative container có thứ tự và unordered. Với set, cùng kiểu với `value_type`. |
| `mapped_type` | Kiểu mapped value. | Chỉ map, multimap và các phiên bản unordered. |
| `key_compare` | Kiểu comparator khóa. | Set/multiset/map/multimap có thứ tự. |
| `value_compare` | Kiểu so sánh phần tử. | Với set cùng kiểu `key_compare`; với map so sánh cặp dựa trên khóa. |
| `hasher`, `key_equal` | Kiểu hash function và predicate tương đương. | Các unordered container. |
| `local_iterator`, `const_local_iterator` | Iterator trong một bucket. | Các unordered container từ C++11. |
| `allocator_type` | Kiểu allocator. | Các container dùng allocator và `string`; `std::array` không có allocator. |

:::note Giá trị trong set không sửa qua iterator
Sách ghi `value_type` của set là hằng. Chính xác hơn, `set<Key>::value_type` là `Key`; tính bất biến được thể hiện ở quyền truy cập phần tử qua iterator, không phải vì alias `value_type` là `const Key`. Với map, `const` thực sự nằm trong kiểu cặp `pair<const Key,T>`.
:::

Ví dụ dùng các alias mà không phụ thuộc kiểu iterator cụ thể:

```cpp
#include <map>
#include <string>

int main() {
    using Prices = std::map<std::string, double>;
    Prices prices{{"apple", 2.5}};
    Prices::iterator it = prices.begin();
    Prices::mapped_type price = it->second;
    return price > 0 ? 0 : 1;
}
```

## 8.2 Tạo, sao chép và hủy

### Constructor mặc định

`container c;` tạo container rỗng với hầu hết các container động và `string`. `std::array<T,N>` là aggregate có kích thước cố định: `std::array<int, 3> a;` để các phần tử `int` chưa được khởi tạo giá trị; `std::array<int, 3> a{};` khởi tạo chúng thành zero. `array<T,0>` là trường hợp rỗng. Không đọc các giá trị chưa được khởi tạo.

### Comparator, hash và bucket

Container có thứ tự có constructor nhận đối tượng comparator, ví dụ `std::set<int, Compare> c(comp)`. Comparator phải xác định strict weak ordering. Unordered container có các overload nhận số bucket tối thiểu, hash function và predicate tương đương; nếu bỏ qua, các đối tượng mặc định tương ứng được dùng. Hai khóa tương đương phải có cùng hash.

Các nguồn dữ liệu có thể kết hợp với comparator hoặc với số bucket, hash và predicate theo overload tương ứng: initializer list hoặc phạm vi iterator `[first,last)`. Số bucket yêu cầu là giới hạn tối thiểu, implementation có thể chọn nhiều hơn.

### Initializer list

```cpp
std::vector<int> a{4, 7}; // hai phần tử: 4 và 7
std::vector<int> b(4, 7); // bốn phần tử đều bằng 7
std::array<int, 3> c{1, 2, 3};
```

Sách liệt kê các nhóm container và string hỗ trợ khởi tạo từ initializer list; `array` là aggregate initialization, không phải constructor initializer-list thành viên. Dấu ngoặc nhọn và ngoặc tròn có thể chọn overload khác nhau như ví dụ vector.

### Copy và move

Copy constructor tạo container mới bằng cách sao chép các phần tử và trạng thái liên quan theo hợp đồng container. Move constructor khởi tạo container mới từ nguồn; với các container chuẩn động, nguồn sau move hợp lệ nhưng trạng thái không được xác định cụ thể trừ khi hợp đồng nói rõ. Không giả định nguồn chắc chắn rỗng.

`std::array` di chuyển từng phần tử theo ngữ nghĩa của kiểu phần tử; không thể coi như chuyển quyền sở hữu một vùng lưu trữ động. Với kiểu phần tử do người dùng định nghĩa, trạng thái sau move phụ thuộc hợp đồng của kiểu đó. Overload nhận allocator có thể thay đổi chi phí và chi tiết move.

### Theo số lượng hoặc phạm vi

| Cách tạo | Ý nghĩa và nhóm áp dụng |
|:---|:---|
| `vector<T>(n)`, `deque<T>(n)`, `list<T>(n)`, `forward_list<T>(n)` | Tạo `n` phần tử được chèn mặc định theo yêu cầu allocator/kiểu; với `int` và allocator chuẩn, chúng có giá trị zero. |
| `container(n, value)` | Tạo `n` bản sao của `value` cho vector, deque, list, forward_list; string cũng có overload tương ứng cho ký tự. |
| `container(first,last)` | Tạo từ các phần tử trong phạm vi nửa mở `[first,last)` cho các sequence động, associative, unordered container và string, nếu iterator và phần tử đáp ứng yêu cầu. |
| `container(first,last,comp)` | Tạo associative container có thứ tự với comparator `comp`. |
| `container(first,last,n,hash,eq)` | Tạo unordered container với tối thiểu `n` bucket và hash/predicate tương ứng; có overload bỏ bớt hash hoặc predicate. |

Phạm vi phải hợp lệ; kiểu nguồn phải hỗ trợ cách xây dựng phần tử đích theo overload. Nhiều constructor còn nhận allocator; sách phân tích chi tiết ở mục 8.10. Destructor hủy các phần tử đang sở hữu và giải phóng tài nguyên của container theo allocator/hợp đồng tương ứng.
