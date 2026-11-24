---
id: chuong-07-phan-13
title: 'Chương 7 · Truy cập và chỉnh sửa map'
sidebar_label: '07 · Phần 13: Truy cập và chỉnh sửa map'
---

# 7.8.2–7.8.4 · Truy cập và chỉnh sửa `map`

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 337–345 (PDF trang 366–374). Các lưu ý và đính chính được ghi rõ.

## Iterator và cặp khóa–giá trị

`map` và `multimap` cung cấp `begin/end`, `cbegin/cend`, `rbegin/rend`, `crbegin/crend`. Iterator là bidirectional, không đáp ứng yêu cầu random access của `std::sort`. Kiểu phần tử là `std::pair<const Key,T>`: có thể thay `second` qua iterator không hằng, nhưng không thể gán cho `first`.

```cpp
std::map<std::string, float> prices{{"hello", 10.0f}};
for (auto& entry : prices) {
    std::cout << entry.first << ": " << entry.second << '\n';
    entry.second += 10; // được: sửa giá trị
    // entry.first = "new"; // lỗi: khóa là const
}
```

Sách in `for (auto elem& : coll)` ở trang 337; cú pháp đúng là `auto& elem`. Trước C++14, lambda có thể khai báo tường minh kiểu `std::pair<const std::string,float>&` hoặc `decltype(prices)::value_type&`. Với C++14 trở lên, generic lambda `[](auto& entry) { ... }` cũng dùng được. Có thể dùng thuật toán tác động riêng `second`, nhưng các thuật toán cần gán lại **toàn bộ cặp** như `std::remove` không phù hợp vì khóa `const`.

## Đổi khóa: chú ý xung đột

Trang 339 của sách đưa ra hàm sao chép giá trị sang khóa mới, rồi xóa khóa cũ. Với `map`, hàm gốc không kiểm tra `insert` thành công: nếu khóa mới đã tồn tại hoặc tương đương khóa cũ, phần tử cũ vẫn bị xóa. Cách viết sau chỉ xóa sau khi chèn thành công và báo kết quả rõ ràng:

```cpp
template<class Map>
bool replace_key(Map& c, const typename Map::key_type& old_key,
                 const typename Map::key_type& new_key) {
    auto old = c.find(old_key);
    if (old == c.end()) return false;
    auto inserted = c.insert(typename Map::value_type(new_key, old->second));
    if (!inserted.second) return false; // khóa mới đã có hoặc tương đương
    c.erase(old);
    return true;
}
```

Hàm trên dành cho **map khóa duy nhất**, không dành cho multimap vì kiểu trả về của `insert` khác; nó cần sao chép được giá trị và không xóa bản cũ nếu việc chèn thất bại. Từ C++17, `extract` và node handle là lựa chọn khác cho một số trường hợp; khi chèn lại phải xử lý kết quả nếu khóa mới xung đột.

Sách cũng minh họa `c["new"] = c["old"]; c.erase("old");`. Cách đó có thể tạo `old` nếu nó chưa tồn tại, ghi đè `new` nếu đã có, hoặc xóa mất phần tử khi hai khóa tương đương. Chỉ dùng khi đã kiểm soát các điều kiện đó.

## Chèn và xóa

| Thao tác | Ý nghĩa |
|:---|:---|
| `insert(pair)` / `emplace(args...)` | Chèn cặp khóa–giá trị; map trả `pair<iterator,bool>`, multimap trả iterator. |
| `insert(hint,pair)` / `emplace_hint(hint,...)` | Chèn với gợi ý vị trí; trả iterator. |
| `insert(first,last)` / `insert({...})` | Chèn phạm vi hoặc initializer list các cặp. |
| `erase(key)` | Xóa mọi phần tử có khóa tương đương, trả số đã xóa. |
| `erase(pos)` / `erase(first,last)` | Xóa theo iterator hoặc phạm vi; từ C++11 trả iterator tiếp theo. |
| `clear()` | Xóa toàn bộ. |

Có thể tạo cặp bằng `{key,value}`, `value_type`, `std::pair` hoặc `std::make_pair`; các chuyển đổi kiểu cần thiết được áp dụng theo overload. `emplace` chuyển tiếp đối số xây dựng cặp; không nhất thiết phải dùng piecewise construction, nhưng `std::piecewise_construct` hữu ích khi cần truyền riêng các đối số cho khóa và giá trị:

```cpp
std::map<std::string, std::complex<float>> values;
values.emplace(std::piecewise_construct,
               std::make_tuple("hello"),
               std::make_tuple(3.4f, 7.8f));
```

Ví dụ cần `<map>`, `<string>`, `<complex>`, `<tuple>` và `<utility>`. Từ C++17, `try_emplace` cho phép xây dựng mapped value từ các đối số khi khóa chưa tồn tại; `insert_or_assign` chèn hoặc gán giá trị. Hãy xét điều kiện kiểu và tác dụng phụ khi chọn overload.

Khi xóa một phần tử trong multimap, dùng iterator thay vì `erase(key)` nếu không muốn xóa cả nhóm. Việc chèn không làm mất hiệu lực iterator tới phần tử đã có; xóa chỉ làm mất hiệu lực iterator và tham chiếu tới phần tử bị xóa. Chèn không hint đặt phần tử tương đương mới vào cuối nhóm; hint có quy tắc vị trí riêng.

### Xóa an toàn trong lúc duyệt

Không tăng một iterator sau khi chính phần tử nó trỏ tới đã bị xóa. C++11 trả iterator tiếp theo từ `erase`:

```cpp
for (auto it = coll.begin(); it != coll.end(); ) {
    if (it->second == value) it = coll.erase(it);
    else ++it;
}
```

Trước C++11, sách dùng `coll.erase(it++)`: hậu tố tăng iterator gốc trước khi gọi hàm và truyền bản sao vị trí cũ để xóa. Từ C++20 có thể dùng `std::erase_if` với predicate phù hợp.

## 7.8.3 Map như mảng kết hợp

| Thao tác | Khi khóa tồn tại | Khi khóa chưa tồn tại |
|:---|:---|:---|
| `c[key]` | Trả tham chiếu tới mapped value. | Chèn khóa mới cùng mapped value được khởi tạo giá trị, rồi trả tham chiếu. |
| `c.at(key)` | Trả tham chiếu tới mapped value. | Ném `std::out_of_range`; không chèn. |

`operator[]` chỉ có trên map không hằng; `at()` có overload cho cả map hằng và không hằng. `multimap` không có hai phép truy cập theo khóa duy nhất này.

```cpp
std::map<std::string, float> coll;
coll["otto"] = 7.7f;       // tạo giá trị float bằng 0 rồi gán 7.7
std::cout << coll["ottto"]; // lỗi chính tả: chèn khóa mới, in 0
// coll.at("missing");     // ném std::out_of_range
```

Với allocator thông thường, mapped type cần có thể được khởi tạo mặc định khi `operator[]` chèn phần tử mới. Việc khởi tạo rồi gán có thể tốn chi phí so với dựng trực tiếp, nhưng hiệu năng phụ thuộc kiểu và hoàn cảnh; sách mô tả phép này chậm hơn một cách tổng quát, điều đó không phải bảo đảm cho mọi chương trình.

## 7.8.4 Ngoại lệ

Sách cho biết bảo đảm exception safety của map và multimap tương tự set và multiset: chèn một phần tử có bảo đảm không tác động khi thất bại trong các điều kiện tương ứng, còn chèn phạm vi có thể đã xử lý một phần trước khi ngoại lệ xảy ra. Comparator, thao tác của phần tử và allocator ảnh hưởng tới bảo đảm cụ thể. `at()` ném `std::out_of_range` khi không tìm thấy khóa.
