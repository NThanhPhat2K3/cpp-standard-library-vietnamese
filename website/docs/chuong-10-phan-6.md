---
id: chuong-10-phan-6
title: 'Chương 10 · Lambda gọi hàm và làm comparator'
sidebar_label: '10 · Phần 6: Lambda gọi hàm và comparator'
---

# 10.3.3–10.3.4 · Lambda gọi hàm và làm tiêu chí

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 502–504 (PDF trang 531–533). Các lưu ý về locale và phiên bản được bổ sung.

## Gọi hàm tự do từ lambda

Sách dùng `std::search` để tìm `Nation` trong `Internationalization`, so sánh từng ký tự sau khi chuyển hoa bằng facet của locale:

```cpp
#include <algorithm>
#include <cassert>
#include <locale>
#include <string>

char myToupper(char c) {
    std::locale loc;
    return std::use_facet<std::ctype<char>>(loc).toupper(c);
}

int main() {
    std::string text("Internationalization");
    std::string sub("Nation");
    auto pos = std::search(text.begin(), text.end(), sub.begin(), sub.end(),
        [](char a, char b) { return myToupper(a) == myToupper(b); });
    assert(pos != text.end());
}
```

Lambda gọi hàm tự do như code thông thường; predicate nhận một ký tự từ mỗi phạm vi. Ví dụ xử lý từng `char` bằng locale, không phải thuật toán so sánh Unicode/UTF-8 hoàn chỉnh. Nếu locale có thể thay đổi trong lúc thuật toán chạy, cần bảo đảm tiêu chí vẫn nhất quán.

## Gọi hàm thành viên

Lambda có thể gọi thành viên trên đối tượng được truyền vào, tương đương ý định của ví dụ `bind` trước đó:

```cpp
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Person {
    std::string name;
    void print() const { std::cout << name << '\n'; }
    void print2(const std::string& prefix) const { std::cout << prefix << name << '\n'; }
};

int main() {
    std::vector<Person> people{{"Tick"}, {"Trick"}, {"Track"}};
    std::for_each(people.begin(), people.end(), [](const Person& p) { p.print(); });
    std::for_each(people.begin(), people.end(),
                  [](const Person& p) { p.print2("Person: "); });
}
```

Lần lượt in ba tên rồi ba tên có tiền tố `Person: `. Dùng `const Person&` vì ví dụ chỉ đọc; muốn sửa đối tượng cần tham chiếu không hằng và container phải cho phép sửa phần tương ứng.

## 10.3.4 Lambda làm hash và equality

Mỗi biểu thức lambda tạo một kiểu closure riêng. Có thể dùng `decltype` để chỉ định các kiểu đó cho unordered container, rồi truyền các đối tượng vào constructor:

```cpp
#include <cassert>
#include <functional>
#include <string>
#include <unordered_set>

struct Person { int id; std::string name; };
int main() {
    auto hash = [](const Person& p) { return std::hash<int>{}(p.id); };
    auto equal = [](const Person& a, const Person& b) { return a.id == b.id; };
    std::unordered_set<Person, decltype(hash), decltype(equal)> people(10, hash, equal);
    people.insert(Person{7, "An"});
    assert(!people.insert(Person{7, "Binh"}).second);
}
```

Hai người cùng `id` được xem là tương đương và có cùng hash; nếu equality dùng tiêu chí khác thì hash phải tương thích với tiêu chí đó. Sách khai báo một tham số equality là `Person&`; ví dụ này dùng `const Person&` cho cả hai.

Trong bối cảnh C++11 của sách, truyền các closure vào constructor là cách cần thiết vì closure không có default constructor tương ứng. Từ C++20, lambda không capture có thêm khả năng khởi tạo mặc định; lambda có capture và các trường hợp khác vẫn có quy tắc riêng. Nếu comparator/hash cần tái sử dụng hoặc có trạng thái phức tạp, một kiểu functor có tên có thể dễ trình bày hơn; lambda hữu ích cho hành vi cục bộ.

### Lambda làm tiêu chí thứ tự

Tương tự, ordered container như `std::set` nhận **kiểu** comparator làm đối số template và nhận **đối tượng** comparator khi khởi tạo. Ví dụ sau xếp theo tên, sau đó theo `id` khi tên giống nhau:

```cpp
#include <cassert>
#include <set>
#include <string>

struct Person { int id; std::string name; };

int main() {
    auto byNameThenId = [](const Person& a, const Person& b) {
        if (a.name != b.name) return a.name < b.name;
        return a.id < b.id;
    };
    std::set<Person, decltype(byNameThenId)> people(byNameThenId);
    people.insert(Person{2, "An"});
    people.insert(Person{1, "An"});
    people.insert(Person{3, "Binh"});
    assert(people.size() == 3);
    assert(people.begin()->id == 1);
    assert(!people.insert(Person{1, "An"}).second);
}
```

Comparator của ordered container phải tạo *strict weak ordering* và giữ cách so sánh nhất quán khi phần tử nằm trong container. Hai phần tử được coi là tương đương khi comparator trả `false` theo cả hai chiều; `set` chỉ giữ một phần tử trong mỗi nhóm tương đương. Trong ví dụ, cùng tên nhưng khác `id` vẫn phân biệt được. Điều kiện này khác với unordered container, nơi hash và equality phải tương thích với nhau.
