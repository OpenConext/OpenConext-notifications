package notifications.api;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Deep links of the client side routes of the GUI */
@Controller
public class SpaController {

    @GetMapping({"/new", "/edit/{id}", "/logged-out"})
    public String spa() {
        return "forward:/index.html";
    }
}
