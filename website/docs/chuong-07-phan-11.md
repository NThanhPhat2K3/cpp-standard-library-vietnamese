---
id: chuong-07-phan-11
title: 'Chương 7 · Chèn và xóa trong set'
sidebar_label: '07 · Phần 11: Chèn và xóa trong set'
---

# 7.7.2–7.7.4 · Chèn, xóa và ví dụ set

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 321–328 (PDF trang 350–357). Các đính chính được nêu riêng.

## Gán và iterator

`set` và `multiset` hỗ trợ copy/move assignment, gán initializer list và `swap`. Với phép gán hoặc hoán đổi, comparator có trạng thái cũng là một phần trạng thái cần xem xét; hai container phải có kiểu phù hợp và thao tác phải thỏa điều kiện allocator.

Các hàm `begin/end`, `cbegin/cend`, `rbegin/rend`, `crbegin/crend` cung cấp iterator hai chiều. Iterator không hỗ trợ các thuật toán đòi random access như `std::sort`. Giá trị khóa không thể được sửa qua iterator: thuật toán `std::remove` thông thường cần ghi đè phần tử nên không phù hợp. Dùng các thao tác xóa của container; từ C++20 còn có `std::erase_if`.

## Chèn và xóa

| Thao tác | Ý nghĩa |
|:---|:---|
| `c.insert(value)` | Chèn một giá trị nếu được phép; set trả `pair<iterator,bool>`, multiset trả iterator. |
| `c.emplace(args...)` | Dựng phần tử từ đối số và chèn; kiểu trả về như `insert` một giá trị. |
| `c.insert(hint,value)` / `c.emplace_hint(hint,args...)` | Chèn với gợi ý vị trí; trả iterator tới phần tử được chèn hoặc phần tử tương đương đã có trong set. |
| `c.insert(first,last)` / `c.insert({...})` | Chèn các phần tử của phạm vi hoặc initializer list. |
| `c.erase(key)` | Xóa **mọi** phần tử tương đương khóa; trả số lượng đã xóa. |
| `c.erase(pos)` | Xóa một phần tử tại iterator hợp lệ, trả iterator tiếp theo từ C++11. |
| `c.erase(first,last)` | Xóa phạm vi `[first,last)`, trả iterator theo sau từ C++11. |
| `c.clear()` | Xóa mọi phần tử. |

Trong `set`, `insert` hoặc `emplace` không có hint trả một cặp: `second` báo có chèn được hay không, `first` trỏ đến phần tử mới hoặc phần tử tương đương đã có. `multiset` cho phép các khóa tương đương nên overload tương ứng chỉ cần trả iterator tới phần tử mới.

```cpp
std::set<double> values;
auto result = values.insert(3.3);
if (result.second) {
    std::cout << "Da chen: " << *result.first << '\n';
} else {
    std::cout << "Da co: " << *result.first << '\n';
}
```

Hint là gợi ý, không ép phần tử vào vị trí sai thứ tự. Nếu phần tử được chèn **ngay trước** hint, độ phức tạp được bảo đảm là hằng số khấu hao; trường hợp tổng quát là logarithmic. Trang 324 sách nói “ngay sau” hint; đó là điểm cần đính chính. Việc dùng `std::distance(c.begin(), it)` để in vị trí thứ tự như sách là thao tác tuyến tính với bidirectional iterator.

Với `multiset`, `erase(key)` xóa toàn bộ phần tử tương đương; muốn xóa một phần tử, lấy một iterator hợp lệ trước:

```cpp
auto it = values.find(key);
if (it != values.end()) values.erase(it); // xóa một phần tử tương đương
```

Nếu cần phần tử **đầu tiên** trong nhóm tương đương, dùng `lower_bound` và kiểm tra kết quả thực sự tương đương. Chèn không làm mất hiệu lực iterator và tham chiếu hiện có; xóa chỉ làm mất hiệu lực iterator và tham chiếu tới phần tử bị xóa. Với multiset từ C++11, chèn và xóa bảo toàn thứ tự tương đối của các phần tử tương đương hiện có. Chèn không có hint đặt phần tử mới ở cuối nhóm tương đương; không áp dụng máy móc kết luận đó cho mọi trường hợp chèn có hint.

## 7.7.3 Ngoại lệ

Sách giải thích rằng chèn một phần tử có bảo đảm thành công hoặc không có tác động nếu thao tác chèn ném ngoại lệ. Chèn cả phạm vi không nhất thiết hoàn tác các phần tử đã chèn trước khi ngoại lệ xảy ra. `erase(key)` có thể gọi comparator và vì vậy có thể ném nếu comparator ném; việc xóa qua iterator và `clear` không gọi comparator để tìm khóa. `swap` có thể ném tùy thao tác hoán đổi comparator và các điều kiện của phiên bản chuẩn. Những bảo đảm này giả định tiền điều kiện hợp lệ và destructor không để ngoại lệ thoát ra.

## 7.7.4 Ví dụ set

Ví dụ của sách tạo set giảm dần, thử chèn trùng, tạo set tăng dần từ phạm vi rồi xóa:

```cpp
#include <algorithm>
#include <functional>
#include <iostream>
#include <iterator>
#include <set>

int main() {
    std::set<int, std::greater<int>> coll1;
    coll1.insert({4, 3, 5, 1, 6, 2});
    coll1.insert(5);
    for (int value : coll1) std::cout << value << ' ';
    std::cout << '\n';

    auto status = coll1.insert(4);
    if (status.second) {
        std::cout << "4 inserted as element "
                  << std::distance(coll1.begin(), status.first) + 1 << '\n';
    } else {
        std::cout << "4 already exists\n";
    }

    std::set<int> coll2(coll1.cbegin(), coll1.cend());
    std::copy(coll2.cbegin(), coll2.cend(), std::ostream_iterator<int>(std::cout, " "));
    std::cout << '\n';
    coll2.erase(coll2.begin(), coll2.find(3));
    auto count = coll2.erase(5);
    std::cout << count << " element(s) removed\n";
    std::copy(coll2.cbegin(), coll2.cend(), std::ostream_iterator<int>(std::cout, " "));
    std::cout << '\n';
}
```

```text
6 5 4 3 2 1
4 already exists
1 2 3 4 5 6
1 element(s) removed
3 4 6
```

`find(3)` là đầu cuối của phạm vi xóa nên 3 được giữ lại. Khởi tạo `coll2` từ iterator cho phép sao chép giá trị sang một container có comparator và kiểu khác; phép gán trực tiếp giữa hai kiểu đó không khả dụng.

### Biến thể multiset

Thay hai kiểu `set` bằng `multiset`, và thay khối xử lý `status` bằng:

```cpp
auto pos = coll1.insert(4);
std::cout << "4 inserted as element "
          << std::distance(coll1.begin(), pos) + 1 << '\n';
```

Lúc này lần chèn 5 thứ hai được giữ, và lần chèn 4 tiếp theo cũng thành công. Kết quả sau cùng là `3 4 4 6`; `erase(5)` xóa hai phần tử. **Trang 328 của sách in lại output của ví dụ set**, nên không phản ánh output thực tế của biến thể multiset.
