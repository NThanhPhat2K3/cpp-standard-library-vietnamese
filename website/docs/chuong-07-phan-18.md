---
id: chuong-07-phan-18
title: 'Chương 7 · Thao tác và bucket của unordered container'
sidebar_label: '07 · Phần 18: Thao tác và bucket'
---

# 7.9.3–7.9.7 · Thao tác và bucket

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 371–376 (PDF trang 400–405). Các chú thích bổ sung được phân biệt trong phần giải thích.

## Chèn và xóa

| Thao tác | Ý nghĩa |
|:---|:---|
| `insert(value)`, `emplace(args...)` | Chèn một phần tử; set/map khóa duy nhất trả `pair<iterator,bool>`, multiset/multimap trả iterator. |
| `insert(hint,value)`, `emplace_hint(hint,args...)` | Dùng iterator gợi ý và trả iterator kết quả; không được dựa vào hint để thiết lập một thứ tự tùy ý. |
| `insert(first,last)`, `insert({...})` | Chèn phạm vi hoặc initializer list. |
| `erase(key)` | Xóa mọi phần tử có khóa tương đương; trả số phần tử đã xóa. |
| `erase(pos)`, `erase(first,last)` | Xóa một phần tử hoặc phạm vi `[first,last)`; trả iterator tiếp theo. |
| `clear()` | Xóa mọi phần tử. |

Với container khóa duy nhất, `pair.second` cho biết có chèn thành công hay đã có khóa tương đương; `pair.first` trỏ tới phần tử tương ứng. Container có nhiều khóa tương đương trả iterator của phần tử được chèn. Các overload có hint có kiểu trả về và quy tắc riêng, xem bảng trên.

Có thể chèn một cặp vào `unordered_map` bằng `{key,value}`, `value_type`, `std::pair` hoặc `std::make_pair`, giống map có thứ tự. `emplace` chuyển tiếp đối số dựng phần tử. Sách minh họa `std::piecewise_construct` cùng hai tuple khi cần chuyển riêng đối số tới constructor của khóa và giá trị; không phải mọi lời gọi `emplace` đều cần hai tuple.

`erase(key)` trên multiset/multimap xóa cả nhóm tương đương. Muốn xóa một phần tử, kiểm tra `auto it = c.find(key)` khác `end()` rồi gọi `c.erase(it)`. `find` không nên được dùng như lời hứa chọn phần tử đầu tiên trong nhóm tương đương. Khi duyệt và xóa, dùng iterator trả về:

```cpp
for (auto it = values.begin(); it != values.end(); ) {
    if (*it < 0) it = values.erase(it);
    else ++it;
}
```

Chèn có thể rehash và làm mất hiệu lực các iterator; con trỏ và tham chiếu tới phần tử hiện có vẫn hợp lệ. Xóa chỉ làm mất hiệu lực iterator và tham chiếu đến phần tử bị xóa. `clear` xóa tất cả phần tử.

## 7.9.4 Giao diện bucket

| Thao tác | Ý nghĩa |
|:---|:---|
| `bucket_count()` | Số bucket hiện tại. |
| `bucket(key)` | Chỉ số bucket nơi khóa sẽ được tìm. |
| `bucket_size(i)` | Số phần tử của bucket `i`. |
| `begin(i)`, `end(i)` | Local iterator cho phạm vi các phần tử trong bucket. |
| `cbegin(i)`, `cend(i)` | Local iterator hằng cho cùng phạm vi. |

Chỉ số phải nhỏ hơn `bucket_count()`. Giao diện này hữu ích khi quan sát sự phân bố, nhưng bucket cụ thể, số bucket và thứ tự duyệt phụ thuộc implementation và có thể đổi sau rehash:

```cpp
#include <iostream>
#include <unordered_set>

int main() {
    std::unordered_set<int> values{1, 2, 3, 5, 7, 11};
    for (std::size_t i = 0; i < values.bucket_count(); ++i) {
        std::cout << "bucket " << i << " (" << values.bucket_size(i) << "):";
        for (auto it = values.cbegin(i); it != values.cend(i); ++it)
            std::cout << ' ' << *it;
        std::cout << '\n';
    }
}
```

Hai khóa cùng bucket chưa chắc có cùng hash hoặc tương đương; xem giải thích về ánh xạ hash ở phần trước. Local iterator duyệt trong một bucket, không thay thế một iterator dùng để duyệt toàn container.

## 7.9.5 `unordered_map` như mảng kết hợp

Tương tự `map`, `unordered_map` có `operator[]` và `at()`, còn `unordered_multimap` không có hai thao tác truy cập theo khóa duy nhất này. `c[key]` trên container không hằng chèn khóa chưa tồn tại với mapped value được khởi tạo giá trị, rồi trả tham chiếu; `at(key)` trả tham chiếu nếu tìm thấy hoặc ném `std::out_of_range` nếu không. Vì vậy đọc nhầm bằng `[]` có thể tạo phần tử ngoài ý muốn. `at()` có overload hằng; `[]` thì không.

## 7.9.6 Xử lý ngoại lệ

Sách nêu rằng chèn một phần tử và `rehash` có bảo đảm thành công hoặc không tác động nếu hash và predicate không ném, cùng các điều kiện áp dụng của chuẩn. `clear` không ném; `erase` và `swap` có bảo đảm phụ thuộc overload và thao tác của hash, predicate, allocator. Chèn nhiều phần tử có thể đã chèn một phần trước khi ngoại lệ xảy ra. Không coi các tóm tắt này là thay thế cho hợp đồng chính xác của overload và phiên bản chuẩn đang dùng.

## 7.9.7 Ví dụ unordered set

Ví dụ đầu tiên của sách chèn giá trị, tính tổng, tìm 19 và xóa các số âm. Hàm in tự đủ thay cho header phụ của sách:

```cpp
#include <iostream>
#include <numeric>
#include <unordered_set>

void print(const std::unordered_set<int>& values) {
    for (int value : values) std::cout << value << ' ';
    std::cout << '\n';
}

int main() {
    std::unordered_set<int> coll{1, 2, 3, 5, 7, 11, 13, 17, 19, 77};
    print(coll);
    coll.insert({-7, 17, 33, -11, 17, 19, 1, 13});
    print(coll);
    coll.erase(33);
    coll.insert(std::accumulate(coll.begin(), coll.end(), 0));
    print(coll);
    if (coll.find(19) != coll.end()) std::cout << "19 is available\n";
    for (auto pos = coll.begin(); pos != coll.end(); ) {
        if (*pos < 0) pos = coll.erase(pos);
        else ++pos;
    }
    print(coll);
}
```

Sau khi xóa 33, tổng các phần tử là 137 nên 137 được thêm vào. Cuối cùng tập có các giá trị `1, 2, 3, 5, 7, 11, 13, 17, 19, 77, 137`; thứ tự in ra không được bảo đảm và có thể khác output minh họa trong sách. `std::accumulate` dùng `int` ở đây vì dữ liệu ví dụ nhỏ; với dữ liệu lớn cần chọn kiểu tổng đủ rộng.
