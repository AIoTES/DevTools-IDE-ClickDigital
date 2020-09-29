package exceptions;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;

import static javax.ws.rs.core.Response.Status.*;

/**
 * This class handles the exceptions to be thrown as a html {@link Response}
 */
public class ExceptionHandler implements ExceptionMapper<Exception> {
    @Override
    public Response toResponse(Exception ex) {
        if (ex.getClass() == UserAlreadyExistsException.class)
            return buildResponse(CONFLICT, ex.getMessage());
        else if (ex.getClass() == InvalidUserDataException.class)
            return buildResponse(UNAUTHORIZED, ex.getMessage());
        else if (ex.getClass() == PlatformNotFoundException.class)
            return buildResponse(NOT_FOUND, ex.getMessage());

        return buildResponse(INTERNAL_SERVER_ERROR, ex.getMessage());
    }

    /**
     * This method builds a Response.
     *
     * @param status  the status code
     * @param message the error mesage
     * @return a {@link Response}
     */
    private Response buildResponse(Response.Status status, String message) {
        return Response.status(status).entity(message).build();
    }
}