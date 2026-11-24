---
id: chuong-10-phan-4
title: 'Chương 10 · Bind và hàm thành viên'
sidebar_label: '10 · Phần 4: Bind và hàm thành viên'
---

# 10.2.2–10.2.3 · Gọi thành viên và functor tự viết

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 491–496 (PDF trang 520–525). Các ghi chú hiện đại được tách khỏi mô tả ví dụ sách.

## Gọi hàm thành viên

`std::bind` nhận con trỏ hàm thành viên; đối số bind tiếp theo chỉ định đối tượng nhận lời gọi. `std::mem_fn` cũng tạo callable từ con trỏ thành viên, nhận đối tượng hoặc con trỏ phù hợp làm đối số đầu.

```cpp
#include <algorithm>
#include <functional>
#include <iostream>
#include <string>
#include <vector>

class Person {
    std::string name_;
public:
    explicit Person(const std::string& name) : name_(name) {}
    void print() const { std::cout << name_ << '\n'; }
    void print2(const std::string& prefix) const { std::cout << prefix << name_ << '\n'; }
    void setName(const std::string& name) { name_ = name; }
};

int main() {
    using namespace std::placeholders;
    std::vector<Person> people{Person("Tick"), Person("Trick"), Person("Track")};
    std::for_each(people.begin(), people.end(), std::bind(&Person::print, _1));
    std::for_each(people.begin(), people.end(), std::bind(&Person::print2, _1, "Person: "));
    std::bind(&Person::print2, _1, "This is: ")(Person("nico"));
    std::for_each(people.begin(), people.end(), std::mem_fn(&Person::print));
    std::for_each(people.begin(), people.end(), std::bind(&Person::setName, _1, "Paul"));
}
```

Ba lời gọi đầu in tên, tên có tiền tố `Person: `, rồi `This is: nico`, như sách. `std::mem_fn(&Person::print2)(person, "Person: ")` nhận đối tượng và đối số bổ sung khi gọi. Có thể dùng con trỏ thô hoặc smart pointer phù hợp làm đối tượng nhận lời gọi; con trỏ phải trỏ tới đối tượng hợp lệ. Hàm ảo vẫn thực hiện virtual dispatch theo quy tắc C++ thông thường.

## Bind thành viên dữ liệu

Sách cộng các mapped value trong map bằng cách bind tới thành viên `second` của kiểu phần tử:

```cpp
#include <cassert>
#include <functional>
#include <map>
#include <numeric>
#include <string>

int main() {
    using namespace std::placeholders;
    using Map = std::map<std::string, int>;
    Map values{{"a", 2}, {"b", 3}};
    int sum = std::accumulate(values.begin(), values.end(), 0,
        std::bind(std::plus<int>{}, _1, std::bind(&Map::value_type::second, _2)));
    assert(sum == 5);
}
```

Trong mỗi bước, `_1` là tổng hiện tại, `_2` là cặp khóa–giá trị, và biểu thức bind lồng nhau lấy `second`. Đây là binary operation, không phải predicate như một câu trong sách mô tả. Lambda có thể diễn đạt cùng ý rõ ràng hơn khi không cần tái sử dụng adapter.

## Phủ định comparator không tạo thứ tự giảm dần

Sách cảnh báo `std::not2(std::less<int>())` có nghĩa là `a >= b`, không phải `a > b`. `>=` không phải strict weak ordering vì `comp(x,x)` đúng, nên không được dùng làm comparator cho `std::sort`. Để sắp giảm dần, dùng `std::greater<int>{}` hoặc so sánh các đối số theo thứ tự đảo.

`not1`/`not2` thuộc nhóm adapter cũ; mã mới có thể dùng `std::not_fn` hoặc lambda khi phép phủ định phù hợp với hợp đồng thuật toán. Phủ định một comparator chặt vẫn không tự biến nó thành comparator chặt hợp lệ.

## 10.2.3 Functor lũy thừa

Sách tạo `fopow<T1,T2>` gọi `std::pow(base,exp)` rồi dùng bind để tính `3^n` và `n^3`:

```cpp
#include <algorithm>
#include <cmath>
#include <functional>
#include <iostream>
#include <iterator>
#include <vector>

template<class Base, class Exp>
struct Power {
    Base operator()(Base base, Exp exponent) const {
        return static_cast<Base>(std::pow(base, exponent));
    }
};

int main() {
    using namespace std::placeholders;
    std::vector<int> values{1,2,3,4,5,6,7,8,9};
    std::transform(values.begin(), values.end(), std::ostream_iterator<float>(std::cout, " "),
                   std::bind(Power<float,int>{}, 3, _1));
    std::cout << '\n';
    std::transform(values.begin(), values.end(), std::ostream_iterator<float>(std::cout, " "),
                   std::bind(Power<float,int>{}, _1, 3));
    std::cout << '\n';
}
```

Kết quả như sách: `3 9 27 81 243 729 2187 6561 19683` và `1 8 27 64 125 216 343 512 729`. `std::pow` là phép toán số thực với quy tắc overload, làm tròn và miền giá trị riêng; chuyển kết quả về kiểu nguyên cần kiểm tra phạm vi và độ chính xác. Nhận xét của sách về overload ở một số hệ thống cũ không nên được hiểu là kết luận chung cho mọi phiên bản C++ hiện đại.
