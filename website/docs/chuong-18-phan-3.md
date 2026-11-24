---
id: chuong-18-phan-3
title: 'Chương 18 · Shared future và thread'
---

Phần này theo mục 18.1.3–18.2.1, trang 960–967. `shared_future` cho phép nhiều nơi quan sát cùng kết quả; `thread` là giao diện cấp thấp hơn để quản lý một luồng thực thi.

## Chia sẻ kết quả

`future<T>::get()` lấy kết quả một lần và làm future mất shared state. `shared_future<T>` có thể sao chép, và mỗi bản sao có thể gọi `get()` nhiều lần để nhận cùng kết quả hoặc cùng ngoại lệ. `future::share()` chuyển state sang shared future và làm future nguồn không còn state.

Với `T` thông thường, `shared_future<T>::get()` trả `const T&` tới giá trị trong shared state; `shared_future<T&>` trả `T&`, còn `shared_future<void>` không trả giá trị. Tham chiếu chỉ hợp lệ khi đối tượng được tham chiếu còn sống; nếu kết quả chứa dữ liệu có thể bị sửa, các truy cập vẫn cần đồng bộ phù hợp.

```cpp
#include <cassert>
#include <future>

int main() {
    auto shared = std::async(std::launch::async, [] { return 21; }).share();
    auto first = std::async(std::launch::async, [shared] { return shared.get() * 2; });
    const int one = shared.get();
    const int doubled = first.get();
    const int again = shared.get();
    assert(one == 21 && doubled == 42 && again == 21);
}
```

Sao chép `shared_future` vào từng task giúp quản lý lifetime của từng handle rõ ràng hơn so với truyền tham chiếu tới cùng đối tượng handle. Shared state có cơ chế đồng bộ để công bố kết quả; nó không tự bảo vệ mọi dữ liệu bên ngoài mà task truy cập.

Sách còn lưu ý rủi ro khi nhiều nơi cùng nhận **ngoại lệ** từ shared state. Không nên bắt ngoại lệ bằng tham chiếu không hằng rồi sửa nó đồng thời trong các thread: các lần ném lại có thể liên quan tới cùng đối tượng ngoại lệ, dẫn đến data race. Nếu chỉ đọc, bắt bằng tham chiếu hằng là một cách diễn đạt rõ ý định:

```cpp
#include <cassert>
#include <future>
#include <stdexcept>

int main() {
    std::promise<int> producer;
    std::shared_future<int> a = producer.get_future().share();
    std::shared_future<int> b = a;
    producer.set_exception(std::make_exception_ptr(std::runtime_error("failed")));
    int caught = 0;
    for (const auto& f : {a, b}) {
        try {
            (void)f.get();
        } catch (const std::runtime_error& e) {
            assert(e.what() != nullptr);
            ++caught;
        }
    }
    assert(caught == 2 && a.valid() && b.valid());
}
```

Ở đây hai lần `get()` tuần tự đều ném lại lỗi đã được lưu, nhưng không làm các shared future mất state. Ví dụ không sửa đối tượng ngoại lệ và không giả định địa chỉ hay chi tiết sao chép của nó; nếu xử lý đồng thời và cần thay đổi dữ liệu dùng chung, chương trình phải tự đồng bộ.

## `std::thread`

`std::thread` trong `<thread>` bắt đầu thực thi callable trên một thread mới; nếu không thể tạo thread, constructor có thể ném `std::system_error`. Khác với `async`, `thread` không trực tiếp cung cấp future cho giá trị trả về. Ngoại lệ không được bắt trong hàm thread dẫn tới `std::terminate()`; muốn chuyển ngoại lệ về nơi khác cần cơ chế như promise/future hoặc `exception_ptr`.

`join()` chờ thread hoàn tất và tạo đồng bộ giữa kết thúc thread với lời gọi `join()` thành công. `detach()` tách quyền sở hữu khỏi `thread` object; thread tiếp tục độc lập, nên người viết phải quản lý vòng đời dữ liệu và thời điểm kết thúc chương trình. Hủy một `std::thread` còn `joinable()` gọi `std::terminate()`.

```cpp
#include <cassert>
#include <thread>

int main() {
    int result = 0;
    std::thread worker([&result] { result = 42; });
    worker.join();
    assert(result == 42); // đọc sau join, khi worker đã kết thúc
}
```

Khi tạo nhiều thread, cần thiết kế xử lý ngoại lệ để mọi đối tượng `thread` đã tạo đều được join hoặc detach trước khi hủy; C++11 không tự join. Đặc biệt cẩn thận với thread tách rời dùng tham chiếu, đối tượng global hoặc dữ liệu đang bị hủy khi chương trình kết thúc. `get_id()` và `std::this_thread::get_id()` cho thread ID; ID không phải thứ tự chạy hay thời gian hoàn thành.
