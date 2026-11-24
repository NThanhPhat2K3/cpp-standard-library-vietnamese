---
id: chuong-08-phan-2
title: 'Chương 8 · Kích thước, tìm kiếm và gán'
sidebar_label: '08 · Phần 2: Kích thước, tìm kiếm và gán'
---

# 8.3–8.4 · Truy vấn và gán container

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 403–408 (PDF trang 432–437). Chi tiết về phiên bản và các trường hợp đặc biệt được làm rõ bên dưới.

## 8.3.1 Kích thước

| Hàm | Ý nghĩa | Nhóm hỗ trợ |
|:---|:---|:---|
| `empty()` | Kiểm tra không có phần tử; độ phức tạp hằng số. | Các container trong sách và `string`. |
| `size()` | Số phần tử hiện tại; độ phức tạp hằng số theo hợp đồng của các container tương ứng. | Các nhóm trên trừ `forward_list`. |
| `max_size()` | Giới hạn lý thuyết số phần tử theo container/allocator và implementation. | Các nhóm trong sách, gồm `forward_list` và `string`. |

`max_size()` không bảo đảm chương trình có đủ bộ nhớ để đạt giá trị đó. `empty()` biểu đạt trực tiếp ý định kiểm tra rỗng; trong mã đa luồng, kiểm tra rồi truy cập vẫn cần đồng bộ khi có sửa đổi đồng thời.

## 8.3.2 So sánh

`==` và `!=` so sánh nội dung hai container cùng kiểu theo hợp đồng tương ứng. Với sequence và associative container có thứ tự, thứ tự phần tử tham gia so sánh; unordered container so sánh theo các nhóm phần tử tương đương thay vì thứ tự duyệt. So sánh phần tử dùng các phép của kiểu phần tử theo yêu cầu, không đơn giản là dùng comparator/hash của container làm `operator==`. So sánh unordered có thể có độ phức tạp xấu nhất bậc hai; cần tuân thủ các điều kiện về predicate và phần tử của chuẩn.

Các container có thứ tự trong sách và `string` hỗ trợ so sánh thứ tự từ điển; unordered container không cung cấp `<`, `<=`, `>`, `>=` giữa hai container. Từ C++20, nhiều container hỗ trợ `<=>` và các phép liên quan theo điều kiện kiểu phần tử. Phép so sánh container không dùng comparator riêng của container để định nghĩa lại thứ tự từ điển của chính hai container.

## 8.3.3 Tìm kiếm trong associative container

Ở set, đối số là giá trị khóa; ở map, đối số là khóa chứ không phải mapped value. Các overload `const` trả `const_iterator`, overload không `const` trả `iterator`.

| Hàm | Kết quả | Nhóm và độ phức tạp |
|:---|:---|:---|
| `count(key)` | Số phần tử có khóa tương đương. | Ordered và unordered; có tính đến số kết quả với nhóm multi. |
| `find(key)` | Một iterator tới khóa tương đương hoặc `end()`. | Ordered logarithmic; unordered trung bình hằng số, xấu nhất tuyến tính. |
| `lower_bound(key)` | Iterator đầu tiên có khóa `k` sao cho `!comp(k,key)`. | Chỉ ordered; logarithmic. |
| `upper_bound(key)` | Iterator đầu tiên có khóa `k` sao cho `comp(key,k)`. | Chỉ ordered; logarithmic. |
| `equal_range(key)` | Cặp iterator của phạm vi nửa mở chứa các khóa tương đương. | Ordered và unordered; độ phức tạp còn phụ thuộc số kết quả. |

Với thứ tự tăng dần, hai cận tương ứng phần tử đầu không nhỏ hơn và phần tử đầu lớn hơn khóa. Ordered `equal_range` tương ứng cặp `lower_bound`/`upper_bound`. **Unordered** cũng có `equal_range` nhưng không có hai hàm cận đó; công thức trong sách không áp dụng trực tiếp cho nhóm unordered. `find` không bảo đảm chọn phần tử đầu tiên trong mọi nhóm trùng; nếu ordered container cần vị trí đầu, dùng `lower_bound` và kiểm tra tương đương. Từ C++20, các container này còn có `contains`.

### Khóa tương đương theo comparator

Trong ordered container, hai khóa `a` và `b` được coi là tương đương khi `!comp(a,b) && !comp(b,a)`. Điều này có thể khác `a == b`. Ví dụ comparator chỉ xét độ dài:

```cpp
#include <cassert>
#include <set>
#include <string>

struct ByLength {
    bool operator()(const std::string& a, const std::string& b) const {
        return a.size() < b.size();
    }
};

int main() {
    std::set<std::string, ByLength> words;
    assert(words.insert("An").second);
    assert(!words.insert("Bo").second); // cùng độ dài, khóa tương đương
    const auto found = words.find("Vy");
    assert(found != words.end() && *found == "An");
    assert(words.count("Vy") == 1);
}
```

`find("Vy")` tìm khóa tương đương theo `ByLength`, không tìm chuỗi có cùng nội dung. Nếu ứng dụng cần giữ nhiều chuỗi cùng độ dài trong `set`, comparator cần thêm tiêu chí phân biệt phù hợp; nếu muốn cho phép khóa tương đương, có thể xem xét `multiset`.

## 8.4 Gán và hoán đổi

| Thao tác | Hiệu ứng | Nhóm hỗ trợ |
|:---|:---|:---|
| `c = other` | Copy assignment: thay nội dung bằng bản sao; tùy kiểu có thể gán, dựng hoặc hủy phần tử. | Các container liệt kê trong sách và `string`, nếu các yêu cầu kiểu được thỏa. |
| `c = std::move(other)` | Move assignment; nguồn hợp lệ nhưng trạng thái sau move thường không được xác định cụ thể. | Container động, `string`, và `std::array` thông qua phép gán move được sinh nếu khả dụng. |
| `c = {…}` | Gán initializer list. | Các container động và `string` có overload tương ứng. |
| `c.assign(n,value)` | Thay nội dung bằng `n` bản sao. | Vector, deque, list, forward_list, string. |
| `c.assign(first,last)`, `c.assign({...})` | Thay nội dung từ phạm vi hoặc initializer list hợp lệ. | Vector, deque, list, forward_list, string. |
| `a.fill(value)` | Gán cùng giá trị cho mọi phần tử của array. | `std::array`. |
| `c.swap(other)`, `swap(c,other)` | Hoán đổi nội dung và trạng thái comparator/hash/predicate theo hợp đồng. | Các nhóm container tương ứng và string. |

Khi `swap` container động thông thường, iterator/tham chiếu tới phần tử vẫn tham chiếu phần tử đó nhưng nó thuộc container kia; iterator `end()` có thể không được bảo toàn. Với `array`, các phần tử ở lại đúng vị trí lưu trữ và được hoán đổi giá trị từng cặp, nên iterator vẫn gắn với array cũ và có thể nhìn thấy giá trị khác. Swap array có độ phức tạp tuyến tính; nhiều container động có swap hằng số, nhưng cần xét các điều kiện về allocator và comparator/hash/predicate. Swap hoặc move assignment không luôn tương đương về hiệu năng, ngoại lệ và trạng thái nguồn; chọn theo ngữ nghĩa mong muốn.

:::note Bổ sung cho sách
Bảng 8.4 không liệt kê `array` cho move assignment, nhưng `std::array` có phép gán move được sinh khi kiểu phần tử cho phép. `array` gán hoặc chuyển từng phần tử; không đổi kích thước. Điều kiện allocator và `noexcept` của `swap` phụ thuộc loại container và phiên bản chuẩn, nên không áp dụng câu “không ném” trong sách cho mọi kiểu phần tử và mọi allocator.
:::

```cpp
#include <array>
#include <vector>

int main() {
    std::vector<int> values{1, 2};
    values.assign(3, 7);       // 7 7 7
    std::array<int, 3> fixed{};
    fixed.fill(4);             // 4 4 4
    return values.size() == fixed.size() ? 0 : 1;
}
```
