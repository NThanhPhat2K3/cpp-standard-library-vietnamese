---
id: chuong-07-phan-17
title: 'Chương 7 · Hash và predicate tùy biến'
sidebar_label: '07 · Phần 17: Hash và predicate tùy biến'
---

# 7.9.2–7.9.3 · Hash và tiêu chí tương đương

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 363–370 (PDF trang 392–399). Ví dụ độc lập được điều chỉnh để minh họa hợp đồng hash.

## Tự định nghĩa hash

Hash function nhận khóa và trả `std::size_t`; container quyết định cách ánh xạ hash vào số bucket hiện tại. Hash không cần biết `bucket_count()`. Cần chọn hàm ổn định đối với khóa đang được lưu và phân bố tốt trên dữ liệu thực tế.

Có thể truyền một function object làm tham số template, hoặc dùng kiểu con trỏ hàm rồi truyền địa chỉ hàm vào constructor. Ví dụ `std::unordered_set<Customer, CustomerHash>` dùng object `CustomerHash`; một hàm tự do có kiểu `std::size_t (*)(const Customer&)` cũng có thể dùng khi được truyền phù hợp.

### Kết hợp nhiều thuộc tính

Sách trình bày cách kết hợp hash lấy cảm hứng từ Boost:

```cpp
#include <cstddef>
#include <functional>

template<class T>
void hash_combine(std::size_t& seed, const T& value) {
    seed ^= std::hash<T>{}(value) + 0x9e3779b9u + (seed << 6) + (seed >> 2);
}
```

Bắt đầu với `std::size_t seed = 0`, rồi gọi `hash_combine(seed, field)` theo thứ tự cho từng trường tham gia nhận diện. Sách dùng thêm variadic template để gom các lời gọi thành `hash_val(a,b,...)`. Phép cộng đơn thuần các hash có thể tạo va chạm có cấu trúc: ví dụ đổi chỗ hai trường cho cùng tổng. Hàm kết hợp trên là ví dụ kỹ thuật, không bảo đảm phân bố tốt cho mọi dữ liệu và không phải hash mật mã; cần đo và kiểm thử với ứng dụng cụ thể.

## Predicate và hợp đồng với hash

Predicate mặc định `std::equal_to<Key>` thường dùng `operator==`. Có thể thay bằng function object khác nếu muốn một khái niệm tương đương riêng. Predicate phải xác định một quan hệ tương đương; đặc biệt, nếu `eq(a,b)` đúng thì **bắt buộc** `hash(a) == hash(b)`. Ngược lại, hash bằng nhau không chứng minh hai khóa tương đương.

Ví dụ sau xem hai khách hàng có cùng mã là một khóa, bất kể tên. Hash và predicate đều chỉ dựa vào mã:

```cpp
#include <cassert>
#include <functional>
#include <string>
#include <unordered_set>

struct Customer {
    long id;
    std::string name;
};
struct CustomerHash {
    std::size_t operator()(const Customer& c) const {
        return std::hash<long>{}(c.id);
    }
};
struct CustomerEqual {
    bool operator()(const Customer& a, const Customer& b) const {
        return a.id == b.id;
    }
};

int main() {
    std::unordered_set<Customer, CustomerHash, CustomerEqual> customers;
    assert(customers.insert(Customer{42, "An"}).second);
    assert(!customers.insert(Customer{42, "Binh"}).second);
    assert(customers.size() == 1);
}
```

Nếu predicate chỉ so `id` nhưng hash thêm `name`, hai khách hàng cùng mã có thể có hash khác nhau và vi phạm hợp đồng. Trang 366 sách minh họa predicate với tham số thứ hai là `Customer&`; thông thường nên nhận cả hai đối số qua `const Customer&`, như ví dụ trên, để có thể so sánh các khóa hằng. Cả hash và predicate đều phải giữ kết quả phù hợp khi khóa tồn tại trong container.

## 7.9.3 Các thao tác chung

`empty()`, `size()`, `max_size()` và so sánh `==`/`!=` được cung cấp. Unordered container không cung cấp thứ tự tổng quát giữa hai container bằng `<`, `>`; chi phí so sánh phụ thuộc dữ liệu, có thể xấu hơn tuyến tính.

| Tìm kiếm | Ý nghĩa |
|:---|:---|
| `find(key)` | Trả iterator tới một phần tử tương đương hoặc `end()`. |
| `count(key)` | Trả số phần tử tương đương. |
| `equal_range(key)` | Trả phạm vi các phần tử tương đương. |
| `contains(key)` | Kiểm tra tồn tại, từ C++20. |

Tìm theo khóa bằng hàm thành viên thường có độ phức tạp trung bình hằng số nhưng có thể tuyến tính trong trường hợp xấu. Với `count` và `equal_range`, cần tính cả số lượng phần tử tương đương. Không dùng kết quả `end()` như iterator tới một phần tử.

Copy/move assignment, gán initializer list và `swap` có sẵn theo yêu cầu kiểu và allocator; trạng thái của hash function và predicate cũng cần được xét khi gán hoặc hoán đổi. Iterator thường được dùng qua `begin/end` và `cbegin/cend`, có thể duyệt tiến nhưng không bảo đảm duyệt lùi. Bảng 7.53 trong sách liệt kê `rbegin/rend` cho unordered container, trái với phần giải thích ngay trước đó: các hàm reverse iterator ấy **không phải** thành viên chuẩn của nhóm này.

Với unordered set, giá trị khóa được nhìn là hằng; với unordered map, `first` là khóa hằng còn `second` có thể sửa nếu iterator và mapped type cho phép. Sách lại in nhầm `auto elem&`; cú pháp đúng là `auto& elem`. Có thể dùng thuật toán để sửa riêng `second`, nhưng thuật toán ghi đè toàn bộ cặp như `std::remove` không phù hợp.

Chèn có thể gây rehash và làm mất hiệu lực iterator; tham chiếu và con trỏ tới phần tử còn tồn tại vẫn hợp lệ. Xóa chỉ làm mất hiệu lực iterator và tham chiếu tới phần tử bị xóa. Điều kiện ngưỡng cụ thể phụ thuộc thao tác và số phần tử thực sự được thêm: không suy ra rằng chỉ cần kích thước *bằng* ngưỡng là chắc chắn xảy ra rehash.
