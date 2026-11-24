---
id: chuong-05-phan-4
title: 'Chương 5 · weak_ptr và vòng sở hữu'
sidebar_label: '05 · Phần 4: weak_ptr'
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 5.2.2 · `std::weak_ptr`

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 84–89 (PDF trang 113–118). Các hộp ghi chú là phần bổ sung.

## Vì sao cần tham chiếu không sở hữu?

`shared_ptr` giúp tự động giải phóng đối tượng khi không còn chủ sở hữu chung. Tuy nhiên, có những trường hợp cơ chế này không đạt được mục đích:

1. **Vòng sở hữu:** nếu hai đối tượng giữ `shared_ptr` đến nhau, mỗi đối tượng vẫn có ít nhất một chủ sở hữu ngay cả khi chương trình đã mất mọi đường truy cập từ bên ngoài. Hai đối tượng sẽ không tự được giải phóng.
2. **Quan sát mà không sở hữu:** đôi khi ta muốn giữ một tham chiếu có thể tồn tại lâu hơn đối tượng, nhưng không muốn việc quan sát kéo dài thời hạn sống của nó. Raw pointer đơn thuần không tự báo rằng đối tượng đã bị hủy.

`std::weak_ptr` giải quyết hai nhu cầu này bằng cách quan sát một nhóm sở hữu của `shared_ptr` mà không góp vào số chủ sở hữu mạnh. Nó được tạo từ `shared_ptr` hoặc `weak_ptr` khác. Khi chủ sở hữu mạnh cuối cùng biến mất, đối tượng bị hủy và weak pointer trở thành **expired**; bản thân weak pointer vẫn có thể tồn tại và theo dõi control block.

Không truy cập đối tượng trực tiếp qua `*` hay `->` trên `weak_ptr`. Trước tiên cần tạo một `shared_ptr` từ nó. Bước đó vừa kiểm tra đối tượng còn sống, vừa giữ quyền sở hữu trong thời gian sử dụng. Có hai cách quan trọng: `lock()` trả `shared_ptr` rỗng khi hết hiệu lực; constructor `shared_ptr` nhận weak pointer hết hiệu lực sẽ ném `std::bad_weak_ptr`.

## Ví dụ: một gia đình tạo vòng sở hữu

Trong mô hình của sách, mỗi `Person` có tên, con trỏ sở hữu chung đến cha mẹ và vector con trỏ sở hữu chung đến các con:

```cpp
#include <iostream>
#include <memory>
#include <string>
#include <vector>

struct Person {
    std::string name;
    std::shared_ptr<Person> mother;
    std::shared_ptr<Person> father;
    std::vector<std::shared_ptr<Person>> kids;

    Person(const std::string& n,
           std::shared_ptr<Person> m = nullptr,
           std::shared_ptr<Person> f = nullptr)
        : name(n), mother(m), father(f) {}
    ~Person() { std::cout << "delete " << name << '\n'; }
};

std::shared_ptr<Person> initFamily(const std::string& name) {
    auto mom = std::make_shared<Person>(name + "'s mom");
    auto dad = std::make_shared<Person>(name + "'s dad");
    auto kid = std::make_shared<Person>(name, mom, dad);
    mom->kids.push_back(kid);
    dad->kids.push_back(kid);
    return kid;
}
```

Sau `auto p = initFamily("nico");`, `p` giữ người con, người con giữ hai cha mẹ, và mỗi cha mẹ giữ người con. Khi các biến cục bộ trong `initFamily` hết phạm vi, người con vẫn có ba chủ sở hữu: `p` và hai phần tử trong vector của cha mẹ.

<figure className="book-figure">
  <img src={useBaseUrl('/img/weak-ptr-figure-5.png')} alt="Sơ đồ gia đình: cha mẹ và con cùng sở hữu lẫn nhau bằng shared_ptr" />
  <figcaption>Hình 5.2 trong sách: gia đình chỉ dùng shared_ptr · trang 87 (PDF trang 116).</figcaption>
</figure>

Nếu gán `p = initFamily("jim")`, gia đình Nico không còn đường truy cập bên ngoài, nhưng vòng sở hữu bên trong vẫn giữ các đối tượng sống; destructor không được gọi. Gia đình Jim cũng bị giữ lại khi `p` hết phạm vi. Đây là rò rỉ do vòng sở hữu, không phải việc con trỏ tự trở thành dangling.

## Phá vòng bằng `weak_ptr`

Thay vector con bằng:

```cpp
std::vector<std::weak_ptr<Person>> kids;
```

Người con vẫn sở hữu cha mẹ qua `shared_ptr`; cha mẹ chỉ **quan sát** người con qua `weak_ptr`. Hình 5.3 dùng nét đứt cho các liên kết yếu:

<figure className="book-figure">
  <img src={useBaseUrl('/img/weak-ptr-figure-6.png')} alt="Sơ đồ gia đình: liên kết từ cha mẹ đến con là weak_ptr nét đứt" />
  <figcaption>Hình 5.3 trong sách: kết hợp shared_ptr và weak_ptr · trang 88 (PDF trang 117).</figcaption>
</figure>

Với mô hình này, khi trả về từ `initFamily`, người con chỉ có một chủ sở hữu mạnh là `p`. Khi `p` bỏ quyền sở hữu, người con bị hủy; các `shared_ptr` cha mẹ bên trong người con cũng bị hủy, từ đó cha mẹ được giải phóng nếu không còn chủ sở hữu nào khác. Sách minh họa việc hủy cả ba người của gia đình Nico, rồi sau đó cả gia đình Jim.

Vì phần tử `kids[0]` giờ là `weak_ptr`, không thể viết `kids[0]->name`. Phải tạo chủ sở hữu tạm bằng `lock()`:

```cpp
if (auto child = p->mother->kids[0].lock()) {
    std::cout << child->name << '\n';
} else {
    std::cout << "Người con không còn tồn tại\n";
}
```

Khi `lock()` thành công, `child` giữ đối tượng sống trong phạm vi `if`. Nếu không còn chủ sở hữu, `lock()` trả về `shared_ptr` rỗng; giải tham chiếu kết quả rỗng là hành vi không xác định. Sách viết rút gọn `kids[0].lock()->name` trong ví dụ mà thời hạn sống được bảo đảm; cách kiểm tra trên an toàn hơn khi không có bảo đảm đó.

:::note Thiết kế quyền sở hữu
Hướng dùng `weak_ptr` phải phản ánh mô hình ứng dụng. Ví dụ của sách cho con sở hữu cha mẹ và cha mẹ chỉ quan sát con; một ứng dụng khác có thể cần hướng sở hữu khác. `weak_ptr` không tự chọn mô hình phù hợp.
:::

## Kiểm tra và chuyển đổi

- `lock()` cố tạo `shared_ptr`; nếu đối tượng đã hết hiệu lực, kết quả rỗng.
- `expired()` cho biết tại thời điểm kiểm tra có còn chủ sở hữu mạnh hay không; tương đương xét `use_count() == 0`.
- `use_count()` trả số chủ sở hữu mạnh tại thời điểm quan sát; sách khuyên chủ yếu dùng để chẩn đoán và lưu ý thao tác này không nhất thiết rẻ.
- Constructor `std::shared_ptr<T>(weak)` ném `std::bad_weak_ptr` nếu weak pointer đã hết hiệu lực.

Ví dụ theo sách:

```cpp
try {
    auto sp = std::make_shared<std::string>("hi");
    std::weak_ptr<std::string> wp = sp;
    sp.reset();
    std::cout << wp.use_count() << '\n';            // 0
    std::cout << std::boolalpha << wp.expired() << '\n'; // true
    std::shared_ptr<std::string> p(wp);              // ném bad_weak_ptr
} catch (const std::exception& e) {
    std::cerr << "exception: " << e.what() << '\n';
}
```

Thông điệp `what()` cụ thể có thể khác giữa implementation; không nên dùng nội dung chuỗi làm điều kiện xử lý lỗi. Trong môi trường đa luồng, `expired()` hoặc `use_count()` chỉ là một quan sát tức thời: đối tượng có thể hết hiệu lực ngay sau đó. Nếu cần sử dụng đối tượng, gọi `lock()` và kiểm tra kết quả trong một bước, rồi giữ `shared_ptr` nhận được suốt thời gian truy cập.
