---
id: chuong-11-phan-7
title: 'Chương 11 · So sánh các phạm vi'
sidebar_label: '11 · Phần 7: So sánh phạm vi'
---

# 11.5.4 · So sánh các phạm vi

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 542–548 (PDF trang 571–577). Các ví dụ dùng C++11 và kiểm tra độ dài cho overload cũ.

## `equal`: so sánh từng vị trí

`std::equal(first,last,second)` kiểm tra từng phần tử `[first,last)` với các phần tử tương ứng bắt đầu tại `second`. Overload predicate dùng `pred(a,b)` thay cho phép bằng. **Caller phải bảo đảm phạm vi thứ hai có ít nhất cùng số phần tử**; nếu dài hơn, overload ba iterator không kiểm tra phần dư.

```cpp
#include <algorithm>
#include <cassert>
#include <list>
#include <vector>

int main() {
    std::vector<int> a{1,2,3,4,5,6,7};
    std::list<int> b{3,4,5,6,7,8,9};
    assert(a.size() == b.size());
    assert(!std::equal(a.begin(), a.end(), b.begin()));
    assert(std::equal(a.begin(), a.end(), b.begin(),
        [](int x, int y) { return (x % 2 == 0) == (y % 2 == 0); }));
}
```

Giá trị hai dãy khác nhau nhưng tính chẵn/lẻ tương ứng. Cách kiểm tra `x % 2 == y % 2` trong sách phù hợp ví dụ dương; với số âm, so sánh kết quả “có chia hết cho 2 không” như trên rõ hơn. Từ C++14 có overload nhận cả hai đầu của cả hai phạm vi; `ranges` cung cấp giao diện tương ứng ở C++20.

## `is_permutation`: cùng phần tử, thứ tự có thể khác

`std::is_permutation` kiểm tra hai dãy có cùng số lần xuất hiện của các giá trị tương đương hay không, không yêu cầu thứ tự giống nhau. Overload predicate phải biểu diễn quan hệ tương đương phù hợp. Overload C++11 chỉ nhận đầu phạm vi thứ hai cần đủ phần tử; không tự phát hiện phần dư.

```cpp
#include <algorithm>
#include <cassert>
#include <deque>
#include <list>
#include <vector>

int main() {
    std::vector<int> a{1,1,2,3,4,5,6,7,8,9};
    std::list<int> b{1,9,8,7,6,5,4,3,2,1};
    std::deque<int> c{11,12,13,19,18,17,16,15,14,11};
    assert(a.size() == b.size() && a.size() == c.size());
    assert(std::is_permutation(a.begin(), a.end(), b.begin()));
    assert(std::is_permutation(a.begin(), a.end(), c.begin(),
        [](int x, int y) { return (x % 2 == 0) == (y % 2 == 0); }));
}
```

`a` và `b` là hoán vị; theo predicate thứ hai, `a` và `c` có cùng số lượng chẵn/lẻ dù giá trị khác. Thuật toán có thể tốn bậc hai trong trường hợp xấu. Nếu cần so sánh hai dãy có độ dài bất kỳ, dùng overload có cả hai đầu khi phiên bản hỗ trợ hoặc kiểm tra độ dài trước.

## `mismatch`: tìm cặp đầu khác nhau

`std::mismatch(first,last,second)` trả cặp iterator tại vị trí đầu tiên không bằng nhau hoặc không thỏa predicate; nếu toàn bộ phạm vi đầu khớp, `first` của cặp là `last` và iterator thứ hai chỉ vị trí tương ứng. Điều này không chứng minh phạm vi thứ hai không có phần dư. Overload ba iterator yêu cầu phạm vi thứ hai đủ dài.

```cpp
#include <algorithm>
#include <cassert>
#include <functional>
#include <list>
#include <vector>

int main() {
    std::vector<int> a{1,2,3,4,5,6};
    std::list<int> b{1,2,4,8,16,3};
    assert(b.size() >= a.size());
    auto different = std::mismatch(a.cbegin(), a.cend(), b.cbegin());
    assert(different.first != a.cend() && *different.first == 3 && *different.second == 4);
    auto notLe = std::mismatch(a.cbegin(), a.cend(), b.cbegin(), std::less_equal<int>{});
    assert(notLe.first != a.cend() && *notLe.first == 6 && *notLe.second == 3);
}
```

Với overload có cả hai đầu, một trong hai iterator kết quả có thể là `end()` do một phạm vi kết thúc trước; kiểm tra cả hai trước khi dereference.

## `lexicographical_compare`: thứ tự từ điển

`std::lexicographical_compare(first1,last1,first2,last2[,comp])` so sánh theo từng vị trí. Cặp đầu tiên không tương đương theo comparator quyết định kết quả; nếu một phạm vi là tiền tố của phạm vi kia, phạm vi ngắn hơn đứng trước. Hai phạm vi tương đương toàn bộ không nhỏ hơn nhau. Comparator phải đáp ứng strict weak ordering phù hợp.

Ví dụ `{1,2}` đứng trước `{1,2,0}`, và `{1,3}` đứng sau `{1,2,9}`. Không được hiểu “khác nhau” theo `operator==` khi comparator có quan hệ tương đương khác; phải xét comparator ở cả hai chiều.
