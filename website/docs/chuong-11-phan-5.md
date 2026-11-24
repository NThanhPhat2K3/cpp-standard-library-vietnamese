---
id: chuong-11-phan-5
title: 'Chương 11 · Tìm phần tử liên tiếp và dãy con'
sidebar_label: '11 · Phần 5: search_n và search'
---

# 11.5.3 · `search_n` và `search`

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 531–536 (PDF trang 560–565). Các ví dụ kiểm tra kết quả trước khi dùng iterator.

## `search_n`: tìm các phần tử liên tiếp

`std::search_n(first,last,count,value)` tìm vị trí bắt đầu đầu tiên của `count` phần tử liên tiếp bằng `value`. Overload nhận thêm binary predicate kiểm tra `pred(element,value)` cho từng phần tử. Nếu không có đoạn phù hợp, hàm trả `last`; nếu `count <= 0`, kết quả là `first`. Phạm vi dùng forward iterator phù hợp.

```cpp
#include <algorithm>
#include <cassert>
#include <deque>
#include <iterator>

int main() {
    std::deque<int> values{1,2,7,7,6,3,9,5,7,7,7,3,6};
    auto sevens = std::search_n(values.begin(), values.end(), 3, 7);
    assert(sevens != values.end() && std::distance(values.begin(), sevens) == 8);
    auto odds = std::search_n(values.begin(), values.end(), 4, 0,
                              [](int element, int) { return element % 2 != 0; });
    assert(odds != values.end());
    assert(*odds == 3 && *std::next(odds, 3) == 7);
}
```

Ba số 7 bắt đầu ở phần tử thứ **9** nếu đếm từ 1. Bốn số lẻ đầu tiên liên tiếp là `3 9 5 7`. Predicate nhận hai đối số; ví dụ bỏ qua giá trị 0 thứ tư vì chỉ cần kiểm tra tính lẻ. Sách dùng `element % 2 == 1` cho dữ liệu dương; `!= 0` còn nhận đúng số lẻ âm trong C++.

Nếu có predicate một đối số, có thể bọc nó trong lambda hai đối số và bỏ qua đối số thứ hai. Ngược lại, `std::greater<int>{}` với giá trị 3 tìm đoạn mà mỗi phần tử lớn hơn 3. Thông báo lỗi của ví dụ sách nhắc “bốn số 7” trong khi đang tìm ba; đó là lỗi thông báo, không đổi điều kiện tìm.

## `search`: tìm dãy con đầu tiên

`std::search(first,last,patternFirst,patternLast)` trả iterator đầu của lần xuất hiện đầu tiên của mẫu trong phạm vi nguồn, hoặc `last` nếu không tìm thấy. Overload predicate kiểm tra từng cặp `pred(sourceElement,patternElement)`. Với mẫu rỗng, kết quả là `first`; cần xử lý riêng trường hợp này nếu viết vòng lặp tìm mọi lần xuất hiện.

```cpp
#include <algorithm>
#include <cassert>
#include <deque>
#include <iterator>
#include <list>
#include <vector>

int main() {
    std::deque<int> values{1,2,3,4,5,6,7,1,2,3,4,5,6,7};
    std::list<int> pattern{3,4,5,6};
    std::vector<int> positions;
    auto pos = values.begin();
    while ((pos = std::search(pos, values.end(), pattern.begin(), pattern.end())) != values.end()) {
        positions.push_back(static_cast<int>(std::distance(values.begin(), pos)) + 1);
        ++pos; // mẫu không rỗng: cho phép phát hiện cả các lần xuất hiện chồng nhau
    }
    assert((positions == std::vector<int>{3, 10}));
}
```

Hai vị trí 3 và 10 được đếm từ 1 như sách. Sau một lần tìm thấy, tăng một bước cho phép tìm các lần xuất hiện chồng nhau. Vòng lặp này dựa vào việc mẫu **không rỗng**; với mẫu rỗng phải định nghĩa cách xử lý riêng và không tăng `end()`.

### Mẫu theo điều kiện

Sách dùng mẫu ba giá trị Boolean `true, false, true` để tìm ba phần tử liên tiếp chẵn–lẻ–chẵn. Predicate nhận phần tử nguồn và giá trị mẫu, không phải hai phần tử cùng kiểu:

```cpp
#include <algorithm>
#include <cassert>
#include <vector>

int main() {
    std::vector<int> values{1,2,3,4,5,6,7,8,9};
    bool pattern[]{true, false, true};
    auto pos = std::search(values.begin(), values.end(), pattern, pattern + 3,
        [](int value, bool even) { return (value % 2 == 0) == even; });
    assert(pos != values.end() && *pos == 2);
}
```

Nếu tiếp tục tìm từ vị trí tiếp theo, các đoạn phù hợp bắt đầu tại vị trí 2, 4 và 6 tính từ 1. Comparator/predicate phải đáp ứng yêu cầu của overload và không sửa các phần tử đang kiểm tra. Chi phí tìm kiếm phụ thuộc độ dài cả nguồn và mẫu; không giả định mọi overload luôn tuyến tính theo riêng nguồn.
