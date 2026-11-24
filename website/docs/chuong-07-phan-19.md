---
id: chuong-07-phan-19
title: 'Chương 7 · Ví dụ hash và kiểm tra bucket'
sidebar_label: '07 · Phần 19: Ví dụ hash và bucket'
---

# 7.9.7 · Ví dụ unordered container

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 377–383 (PDF trang 406–412). Các ví dụ được trình bày lại và có ghi chú đính chính.

## `unordered_multiset` và phần tử trùng

Sách bắt đầu với mười số, chèn thêm các giá trị có lặp, rồi xóa mọi số 17 và xóa một số 13:

```cpp
#include <cassert>
#include <unordered_set>

int main() {
    std::unordered_multiset<int> coll{1, 2, 3, 5, 7, 11, 13, 17, 19, 77};
    coll.insert({-7, 17, 33, -11, 17, 19, 1, 13});
    assert(coll.count(17) == 3 && coll.count(13) == 2);
    coll.erase(17); // xóa cả ba
    auto pos = coll.find(13);
    if (pos != coll.end()) coll.erase(pos); // xóa một
    assert(coll.count(17) == 0 && coll.count(13) == 1);
}
```

Số phần tử giảm từ 18 xuống 14; thứ tự in các phần tử không được xác định bởi chuẩn. Trái lại, để cộng các giá trị hoặc tìm và xóa mọi giá trị âm, phải duyệt các phần tử vì thao tác đó không phải tìm theo một khóa cụ thể.

## Hash và predicate cho `Customer`

Ví dụ sách tạo `Customer` có tên, họ và số khách hàng, rồi dùng function object cho hash và equality. Tuy nhiên hash gốc kết hợp **cả ba trường**, còn equality chỉ so số khách hàng. Nếu hai đối tượng cùng số mà khác tên, chúng tương đương nhưng có thể có hash khác nhau, vi phạm hợp đồng của unordered container. Giả định số khách hàng duy nhất trong dữ liệu thực tế không đủ để biến hai hàm đó thành một cặp an toàn cho mọi đầu vào hợp lệ. Phần trước đã minh họa cách nhất quán: cả hai cùng dựa vào `id`.

Sách cũng minh họa khai báo hai lambda, dùng `decltype` để lấy kiểu closure và truyền đối tượng lambda vào constructor. Dưới đây là phiên bản tự đủ và nhất quán theo số khách hàng:

```cpp
#include <cassert>
#include <functional>
#include <string>
#include <unordered_set>

struct Customer {
    std::string firstname;
    std::string lastname;
    long number;
};

int main() {
    auto hash = [](const Customer& c) { return std::hash<long>{}(c.number); };
    auto equal = [](const Customer& a, const Customer& b) {
        return a.number == b.number;
    };
    std::unordered_set<Customer, decltype(hash), decltype(equal)> customers(10, hash, equal);
    customers.insert(Customer{"nico", "josuttis", 42});
    assert(customers.count(Customer{"other", "name", 42}) == 1);
}
```

Các lambda không capture được dùng làm hash và predicate; `decltype(hash)` và `decltype(equal)` là hai kiểu closure riêng. Việc truyền các đối tượng vào constructor cũng hoạt động với C++11. Sách nói lambda không có default constructor và assignment operator: đó là bối cảnh C++11 của sách; từ C++20, lambda **không capture** có thêm các phép mặc định tương ứng. Điều kiện cụ thể phụ thuộc phiên bản và dạng capture.

## Quan sát các bucket

Sách viết hàm `printHashTableState` in size, số bucket, load factor, maximum load factor và các phần tử trong từng bucket. Dưới đây là phiên bản cho container các số, không phỏng đoán cấu trúc bên trong:

```cpp
#include <iomanip>
#include <iostream>
#include <unordered_set>

void printHashTableState(const std::unordered_set<int>& cont) {
    std::cout << "size: " << cont.size()
              << "\nbuckets: " << cont.bucket_count()
              << "\nload factor: " << cont.load_factor()
              << "\nmax load factor: " << cont.max_load_factor() << '\n';
    for (std::size_t i = 0; i < cont.bucket_count(); ++i) {
        std::cout << "b[" << std::setw(2) << i << "]: ";
        for (auto it = cont.cbegin(i); it != cont.cend(i); ++it)
            std::cout << *it << ' ';
        std::cout << '\n';
    }
}

int main() {
    std::unordered_set<int> numbers{1, 2, 3, 5, 7, 11, 13, 17, 19};
    printHashTableState(numbers);
    numbers.insert({-7, 17, 33, 4});
    printHashTableState(numbers);
}
```

`17` đã tồn tại, vì vậy sau lần chèn thứ hai có 12 phần tử. Số bucket, các giá trị hash và cách phân bố phụ thuộc implementation; lần chèn **có thể** gây rehash. Sách in ví dụ một implementation đổi từ 11 sang 23 bucket, không phải kết quả bắt buộc.

:::note Không suy luận cấu trúc nội bộ từ iterator
Hàm gốc trong sách kiểm tra `iterator_category` rồi kết luận danh sách liên kết đơn hay kép. Category chỉ mô tả khả năng của iterator, không chứng minh representation bên trong; so sánh bằng `typeid` còn không xét các category mạnh hơn hoặc dẫn xuất. Vì vậy ví dụ trên không đưa ra kết luận đó.
:::

## Từ điển `unordered_multimap`

Sách dùng cùng dữ liệu từ điển như ví dụ map: ban đầu có `day → Tag`, `strange → fremd`, `car → Auto`, `smart → elegant`, `trait → Merkmal`, `strange → seltsam`. Sau đó thêm `smart → raffiniert`, `smart → klug` và `clever → raffiniert`, rồi in trạng thái bucket:

```cpp
#include <string>
#include <unordered_map>

int main() {
    std::unordered_multimap<std::string, std::string> dict{
        {"day", "Tag"}, {"strange", "fremd"}, {"car", "Auto"},
        {"smart", "elegant"}, {"trait", "Merkmal"}, {"strange", "seltsam"}
    };
    dict.insert({{"smart", "raffiniert"}, {"smart", "klug"},
                 {"clever", "raffiniert"}});
    dict.max_load_factor(0.7f);
    // Duyệt i từ 0 đến bucket_count(), và dùng cbegin(i)/cend(i)
    // để xem entry.first và entry.second của từng bucket.
}
```

Việc đặt `max_load_factor` thay đổi ngưỡng được container sử dụng; không nên giả định lời gọi setter tự nó chắc chắn rehash ngay. Nếu muốn yêu cầu bố trí lại dựa trên ngưỡng hiện tại, có thể gọi `rehash` hoặc `reserve` phù hợp. Các nhóm phần tử có khóa tương đương vẫn có thể được truy xuất qua `equal_range`.
